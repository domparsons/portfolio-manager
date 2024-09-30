import React, { useState } from 'react';
import { Input, Form, message, Button } from 'antd';
import 'antd/dist/reset.css';

function PaceCalculatorPage() {
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [pace, setPace] = useState('');

  const calculatePace = () => {
    if (!hours && !minutes && seconds === '') {
      message.error('Please enter a time');
      return;
    } else if (!distance) {
      message.error('Please enter distance.');
    }

    const distanceKm = parseFloat(distance);
    const hoursValue = parseInt(hours, 10);
    const minutesValue = parseInt(minutes, 10);
    const secondsValue = parseInt(seconds, 10);

    // if (isNaN(distanceKm) || isNaN(hoursValue) || isNaN(minutesValue) || isNaN(secondsValue)) {
    //   message.error('Please enter valid numbers.');
    //   return;
    // }

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

  return (
    <div className="main-page p-6 flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full sm:w-1/2 lg:w-1/3">
        <h1 className="text-2xl font-bold mb-6 text-center">Pace Calculator</h1>

        <Form
          layout="vertical"
          onFinish={calculatePace}
          className="mb-4"
        >
          <Form.Item
            label="Distance (km)"
            rules={[{ required: true, message: 'Please enter the distance.' }]}
          >
            <Input
              placeholder="Enter distance in km"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Time">
            <div className="flex gap-4">
              <Input
                placeholder="Hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                size="large"
                style={{ flex: 1 }}
              />

              <Input
                placeholder="Minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                size="large"
                style={{ flex: 1 }}
              />

              <Input
                placeholder="Seconds"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
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
            <p className="text-lg">Your pace is:</p>
            <strong className="text-xl">{pace}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaceCalculatorPage;
