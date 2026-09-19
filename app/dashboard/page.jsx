'use client'

import React, { useContext, useEffect, useState } from 'react'
import 'chart.js/auto'
import { Button, Card, Col, Container, Row, Placeholder } from 'react-bootstrap'
import axios from 'axios'
import Link from 'next/link'
import {
  FaMoneyBillWave,
  FaFileInvoice,
  FaFileSignature,
  FaTruckLoading,
  FaQuestionCircle,
  FaShoppingCart,
  FaPlus,
} from 'react-icons/fa'
import RevenueChart from '@/app/components/RevenueChart';
import PendingsChart from '@/app/components/PendingsChart';
import { useStore } from '../Store';
import { useRouter } from 'next/navigation';

const compactNumber = (value) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0)

const quickActions = [
  { name: 'Record Expense', href: '/dashboard/Account/AddExpenses', icon: <FaMoneyBillWave/>, variant: 'outline-danger' },
  { name: 'Create Invoice', href: '/dashboard/Sales', icon: <FaFileInvoice/>, variant: 'outline-primary' },
  { name: 'Create Quote', href: '/dashboard/Quotation/Quotations', icon: <FaFileSignature/>, variant: 'outline-info' },
  { name: 'Create Delivery Note', href: '/dashboard/DeliveryNote', icon: <FaTruckLoading/>, variant: 'outline-success' },
  { name: 'Create Enquiry', href: '/dashboard/Enquiry/Enquiries', icon: <FaQuestionCircle/>, variant: 'outline-warning' },
  { name: 'Add Purchase', href: '/dashboard/Purchase/Purchase', icon: <FaShoppingCart/>, variant: 'outline-secondary' },
]

const Page = () => {

  const {state} = useContext(useStore)
  const {userData} =state

  const router = useRouter()

  const [metrics, setMetrics] = useState(null)
  const [metricsError, setMetricsError] = useState(false)

  useEffect(()=>{

    if(!userData){
      router.replace('/')
    }
  }, [userData])

  useEffect(() => {
    if (!userData) return

    axios.get('/api/reports/dashboard-summary')
      .then((res) => setMetrics(res.data))
      .catch((error) => {
        console.error('Failed to load dashboard metrics:', error)
        setMetricsError(true)
      })
  }, [userData])

  const statCards = [
    { title: 'CUSTOMERS', img: '/images/customer.png', value: metrics?.customersCount, addHref: '/dashboard/Customer/AddCustomer' },
    { title: 'SUPPLIERS', img: '/images/supplier.png', value: metrics?.suppliersCount, addHref: '/dashboard/Supplier/AddSupplier' },
    { title: 'TOTAL SALES', img: '/images/sale.png', value: compactNumber(metrics?.totalSales), addHref: '/dashboard/Sales' },
    { title: 'TOTAL PURCHASES', img: '/images/purchase.png', value: compactNumber(metrics?.totalPurchases), addHref: '/dashboard/Purchase/Purchase' },
  ]

  return (
    <Container>
      <Row className='g-2 mb-3'>
        {quickActions.map((action) => (
          <Col xs={6} md={4} lg={2} key={action.name}>
            <Button
              as={Link}
              href={action.href}
              variant={action.variant}
              className='w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-2 py-3'
            >
              <span style={{ fontSize: '1.75rem' }}>{action.icon}</span>
              <span className='small fw-semibold'>{action.name}</span>
            </Button>
          </Col>
        ))}
      </Row>
      <Row className='border p-3 bg-light'>
        {statCards.map((stat) => (
          <Col key={stat.title}>
            <Card className='p-1 position-relative'>
              <Button
                as={Link}
                href={stat.addHref}
                variant='primary'
                size='sm'
                className='position-absolute rounded-circle d-flex align-items-center justify-content-center p-0'
                style={{ top: 6, right: 6, width: 24, height: 24, zIndex: 1 }}
                title={`Add ${stat.title.toLowerCase()}`}
              >
                <FaPlus size={10}/>
              </Button>
              <Card.Title>{stat.title}</Card.Title>
              <Card.Img src={stat.img} style={imgStyle}/>
              <Card.Body>
                <Card.Text>
                  {metrics ? (
                    <strong>{stat.value}</strong>
                  ) : metricsError ? (
                    <strong className='text-danger'>--</strong>
                  ) : (
                    <Placeholder as='strong' animation='glow'>
                      <Placeholder xs={6}/>
                    </Placeholder>
                  )}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className='my-3 border'>
        <RevenueChart/>
        <PendingsChart
          receivables={metrics?.receivablesTotal}
          payables={metrics?.payablesTotal}
          loading={!metrics && !metricsError}
        />
      </Row>
    </Container>
  )
}


const imgStyle ={
  height: 50,
  width: 50,
  objectFit: 'contain',
  position: "absolute",
  bottom: 2,
  right: 4
}



export default Page
