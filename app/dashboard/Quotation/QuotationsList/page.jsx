'use client'

import Calender from '@/app/components/Calender'
import XlsExportButton from '@/app/components/XlsExportButon'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {Container, ButtonToolbar, Col, Row, Form,
  ButtonGroup, Table, Button, InputGroup,
  Stack, Badge} from 'react-bootstrap'
import { toast } from 'react-toastify'
import { round2 } from '../../utils'

const QuotationList =  () => {

  const [quotations, setQuotations] = useState([])

  const getData = async()=>{
    const {data} = await axios.get(`/api/quotation`)
    setQuotations(data)
  } 


  useEffect(()=>{
    getData()
  }, [])


  const handlePrint = async({customerId, controlId, quotationNo})=>{
    
    if(window.confirm (`Print Quotation ${quotationNo}`)){
      toast.promise(
        axios.post(`/api/quotation/print/${quotationNo}/${controlId}/${customerId}`,
          {},
          {responseType:"blob"}
        ).then((response)=>{
        const blob = new Blob([response.data], {type:"application/pdf"})
        const url = window.URL.createObjectURL(blob)
        window.open(url, "_blank")
      }),
      {
        pending:"...wait",
        success:"Done!",
        error:"Oops try again!"
      }
      )
    }
  } 
  return (
    <Container fluid>
      <h1>Quotations List</h1>
      <Row className='bg-light p-3 border'>
      <ButtonToolbar className='mb-2'>
        <Col className='col-md-2'>
        <Calender title='FromDate'/>
        </Col>
        <Col className='mx-1 col-md-2'>
        <Calender title='EndDate'/>
        </Col>
        <Col className='m-1 col-xs-12'>
        <Form.Control type='text' placeholder='customer Mobile'/>
        </Col>
        <Col className='m-1'>
        <Form.Control type='text' placeholder='customer Name'/>
        </Col>
        <Col>
        <Col className='m-1 col-xs-12'>
        <ButtonGroup>
        <Button size='md' variant='outline-danger'>RESET</Button>
        <Button size='md' variant='outline-warning'>SEARCH</Button>
        <XlsExportButton data={quotations}/>
        <Button size='md'>PRINT</Button>
        </ButtonGroup>
        </Col>
        </Col>
      </ButtonToolbar>
      <Row>
        <Col className='col-md-2'>
          <Form.Group>
            <Form.Select>
              <option>--entries--</option>
              {[100, 150, 200, 250].map((x, index)=>(
                <option key={index}>{x}</option>
              ))}
        </Form.Select>
        </Form.Group>
        </Col>
        <Col className='col-md-8'>
        <InputGroup>
          <Form.Control type='text' placeholder='search' aria-describedby='addon1'/>
            <Button id='addon1' variant='outline-dark'>
              🔍
            </Button>
        </InputGroup>
        </Col>
        <Col>
          <Button variant='danger'>ADD QUOTATION</Button>
        </Col>
      </Row>
      </Row>

      <Table striped='columns' bordered hover responsive className='m-2 align-middle'>
        <thead>
          <tr>
            <th>#</th>
            <th>Quote</th>
            <th>Date</th>
            <th>Customer</th>
            <th className='text-end'>Total</th>
            <th>Approval</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations?.map((quotation, index)=> (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <Badge>{quotation.quotationNo}</Badge>
                <div className='text-muted small'>{quotation.controlId}</div>
              </td>
              <td>{new Date(quotation.createdAt)?.toLocaleDateString()}</td>
              <td>{quotation.customerName}</td>
              <td className='text-end'>{round2(quotation.totalAfterDiscount || quotation.totalWithVat || 0).toFixed(2)}</td>
              <td>
                <Badge bg={quotation.approved ? 'success' : 'secondary'}>
                  {quotation.approved ? 'APPROVED' : 'PENDING'}
                </Badge>
              </td>
              <td>
                <Stack gap={2} direction='horizontal'>
                    <Button variant='outline-success btn-sm' onClick={()=> handlePrint(quotation)} title='Print'>🖨</Button>
                  </Stack>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
            <tr>
              <th colSpan={4}>Totals</th>
              <td className='text-end'>{round2(quotations.reduce((acc, curr)=> acc + (curr.totalAfterDiscount || curr.totalWithVat || 0), 0)).toFixed(2)}</td>
              <td colSpan={2}></td>
            </tr>
        </tfoot>
      </Table>
    </Container>
  )
}


export default QuotationList
