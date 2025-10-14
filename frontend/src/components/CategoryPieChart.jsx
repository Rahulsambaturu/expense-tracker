import React from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function CategoryPieChart({ data }) {
  // data: array of { label, value }
  const labels = data.map(d => d.label)
  const values = data.map(d => d.value)
  const colors = [
    '#4dc9f6','#f67019','#f53794','#537bc4','#acc236','#166a8f','#00a950','#58595b','#8549ba','#2ecc71','#e74c3c','#3498db'
  ]

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  }

  return (
    <div style={{ width: 260, height: 260, margin: '0 auto' }}>
      <Pie data={chartData} options={options} />
    </div>
  )
}
