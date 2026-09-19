'use client'

import { useEffect, useState } from "react";
import { Col, Spinner } from "react-bootstrap";
import 'chart.js/auto'
import dynamic from "next/dynamic";
import axios from "axios";

const LineChart = dynamic(()=> import('react-chartjs-2').then((mod)=> mod.Line), {ssr: false})


const RevenueChart = () => {

    const [monthly, setMonthly] = useState(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        axios.get('/api/reports/monthly-summary', { params: { months: 6 } })
            .then((res) => setMonthly(res.data))
            .catch((err) => {
                console.error('Failed to load monthly summary:', err)
                setError(true)
            })
    }, [])

    const data = {
        labels: monthly?.map((m) => m.label) || [],
        datasets: [
          {
            label: 'Sales',
            data: monthly?.map((m) => m.sales) || [],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.2,
          },
          {
            label: 'Purchases',
            data: monthly?.map((m) => m.purchases) || [],
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.2,
          },
        ],
    };

  return (
    <Col className="col-md-8">
        <h1>Revenue Chart</h1>
        {error ? (
          <p className="text-danger">Failed to load revenue data</p>
        ) : !monthly ? (
          <Spinner animation="border" size="sm"/>
        ) : (
          <LineChart data={data}/>
        )}
    </Col>
  )
}

export default RevenueChart
