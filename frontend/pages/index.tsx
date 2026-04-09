import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, HealthResponse, WelcomeResponse } from '@/lib/api';

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [message, setMessage] = useState<WelcomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch health and welcome message
        const [healthData, messageData] = await Promise.all([
          api.health(),
          api.welcome(),
        ]);

        setHealth(healthData);
        setMessage(messageData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🚀 AroRano</h1>
      <p>IoT Device Management & Monitoring Platform</p>

      <hr style={{ margin: '30px 0' }} />

      {loading && (
        <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
          ⏳ Loading data from API...
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
          ❌ Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h2>✨ Welcome Message</h2>
            <p style={{ fontSize: '18px', color: '#1976d2' }}>
              {message?.message || 'No message'}
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>💚 Server Status</h2>
            <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <p>
                <strong>Status:</strong> <span style={{ color: '#4caf50' }}>{health?.status}</span>
              </p>
              <p>
                <strong>Message:</strong> {health?.message}
              </p>
            </div>
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e8f5e9', 
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #4caf50'
          }}>
            <h3 style={{ marginTop: 0 }}>📊 IoT Monitoring Dashboard</h3>
            <p>Manage and monitor your connected IoT devices, view sensor readings, and track device statistics.</p>
            <Link href="/dashboard">
              <a style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}>
                → Go to Dashboard
              </a>
            </Link>
          </div>

          <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
            <h3>📚 Resources</h3>
            <ul>
              <li>
                <a href="http://localhost:3001/api/docs" target="_blank" rel="noopener noreferrer">
                  Swagger API Documentation
                </a>
              </li>
              <li>
                <a href="http://localhost:3001/api/health" target="_blank" rel="noopener noreferrer">
                  API Health Check
                </a>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
