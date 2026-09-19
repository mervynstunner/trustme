'use client'

import React from 'react'
import 'chart.js/auto'
import dynamic from 'next/dynamic'
import { Col, Spinner } from 'react-bootstrap'


const PieChart = dynamic(()=> import('react-chartjs-2').then((mod)=> mod.Pie), {ssr: false})

const PendingsChart = ({ receivables, payables, loading }) => {
    const data = {
        labels: ['Receivables', 'Payables'],
        datasets: [
          {
            label: 'Receivables & Payables',
            data: [receivables || 0, payables || 0],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',

            ],
             borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1,
            hoverOffset: 4
          },
        ],
      };
  return (
    <Col className='col-md-4'>
      <h1>Pendings Chart</h1>
      {loading ? <Spinner animation="border" size="sm"/> : <PieChart data={data}/>}
    </Col>
  )
}

export default PendingsChart
