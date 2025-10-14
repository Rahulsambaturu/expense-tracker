import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function MonthlyLineChart({ values, year }) {
  // values: array of 12 numbers for Jan..Dec
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const data = {
    labels,
    datasets: [
      {
        label: `Monthly total ${year}`,
        data: values,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        tension: 0.25,
        fill: true,
        pointRadius: 3,
      }
    ]
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true }
    }
  }
  return (
    <div style={{ width: 260, height: 260, margin: '0 auto' }}>
      <Line data={data} options={options} />
    </div>
  )
}
