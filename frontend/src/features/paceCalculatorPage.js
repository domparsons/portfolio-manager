import React, { useState } from 'react';
import { Input, Form, message, Button } from 'antd';
import 'antd/dist/reset.css';



function MainPage() {
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [pace, setPace] = useState('');

  const calculatePace = () => {
    if (!distance || !time) {
      message.error('Please enter both distance and time.');
      return;
    }

    // Convert distance to kilometers and time to minutes
    const distanceKm = parseFloat(distance);
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    if (distanceKm <= 0 || totalMinutes <= 0) {
      message.error('Distance and time must be positive numbers.');
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

        {/* Ant Design Form for Inputs */}
        <Form
          layout="vertical"
          onFinish={calculatePace}
          className="mb-4"
        >
          {/* Distance Input */}
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

          {/* Time Input */}
          <Form.Item
            label="Time (hh:mm)"
            rules={[{ required: true, message: 'Please enter the time in hh:mm format.' }]}
          >
            <Input
              placeholder="Enter time (hh:mm)"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              size="large"
            />
          </Form.Item>

          {/* Calculate Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Calculate Pace
            </Button>
          </Form.Item>
        </Form>

        {/* Display the Pace Result */}
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

export default MainPage;