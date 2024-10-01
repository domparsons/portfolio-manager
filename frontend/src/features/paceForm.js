import React, { useState } from 'react';
import { Input, Form, message, Button } from 'antd';
import 'antd/dist/reset.css';

function PaceForm() {
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [pace, setPace] = useState('');

  const calculatePace = () => {
    if (!distance) {
      message.error('Please enter a distance.');
      return;
    }

    if (!hours && !minutes && !seconds) {
      message.error('Please enter a time!');
      return;
    }

    const distanceKm = parseFloat(distance);
    const hoursValue = parseInt(hours, 10) || 0;
    const minutesValue = parseInt(minutes, 10) || 0;
    const secondsValue = parseInt(seconds, 10) || 0;

    if (distanceKm <= 0 || hoursValue < 0 || minutesValue < 0 || secondsValue < 0) {
      message.error('Distance and time values must be positive.');
      return;
    }

    const totalMinutes = hoursValue * 60 + minutesValue + secondsValue / 60;

    if (totalMinutes <= 0) {
      message.error('Total time must be greater than zero.');
      return;
    }

    const paceMinutes = totalMinutes / distanceKm;
    const paceMinutesRounded = Math.floor(paceMinutes);
    const paceSeconds = Math.round((paceMinutes - paceMinutesRounded) * 60);

    setPace(`${paceMinutesRounded}m ${paceSeconds}s per km`);
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    <div className="main-page p-6 flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full sm:w-1/2 lg:w-1/3">
        <h1 className="text-2xl font-bold mb-6 text-center">Pace Calculator</h1>

        <Form layout="vertical" onFinish={calculatePace} className="mb-4">
          <Form.Item
            label="Distance (km)"
            rules={[{ required: true, message: 'Please enter the distance.' }]}
          >
            <Input
              placeholder="Enter distance in km"
              value={distance}
              onChange={handleInputChange(setDistance)}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Time">
            <div className="flex gap-4">
              <Input
                placeholder="Hours"
                value={hours}
                onChange={handleInputChange(setHours)}
                size="large"
                style={{ flex: 1 }}
              />

              <Input
                placeholder="Minutes"
                value={minutes}
                onChange={handleInputChange(setMinutes)}
                size="large"
                style={{ flex: 1 }}
              />

              <Input
                placeholder="Seconds"
                value={seconds}
                onChange={handleInputChange(setSeconds)}
                size="large"
                style={{ flex: 1 }}
              />
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Calculate Pace
            </Button>
          </Form.Item>
        </Form>

        {pace && (
          <div className="text-center mt-4">
            <strong className="text-xl">{pace}</strong>
          </div>
        )}
        {/*Access root api and print message*/}
        <Button type="primary" block size="large" onClick={async () => {
          try {
            const response = await fetch('http://127.0.0.1:8000/personal_bests/', {
              method: 'POST',  // Specify the method
              headers: {
                'Content-Type': 'application/json', // Set content type to JSON
              },
              body: JSON.stringify({
                time: 123.45,     // Replace with actual values from your input
                distance: 10.0,
                pace: 12.3,
              }),
            });

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data); // Log the response from the server

          } catch (error) {
            console.error('Error:', error);
          }
        }}>
          Button
        </Button>
      </div>
    </div>
  );
}

export default PaceForm;