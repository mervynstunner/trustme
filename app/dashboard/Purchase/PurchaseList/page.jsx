'use client'

import XlsExportButton from '@/app/components/XlsExportButon'
import DocumentPreview from '@/app/components/DocumentPreview'
import axios from 'axios'
import { useEffect, useState } from 'react'
import {Container, Stack, ButtonToolbar, Col, Row, Form, ButtonGroup, Button, Table, InputGroup, Badge } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { round2, formatAmount } from '../../utils'

const PurchaseList = ()=> {


  const [purchases, setPurchases] = useState([])
  const [limit, setLimit] = useState(null)
  const [selectedPurchase, setSelectedPurchase] = useState({})
  const [showPreview, setShowPreview] = useState(false)
  const [date, setDate] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  
  //const startDateStr = date.startDate? // YYYY-MM-DD format
  //const endDateStr = date.endDate?
  
  
  useEffect(()=>{
    const getData = async()=>{
      const {data} = await axios.get(`/api/purchase?startDate=${date.startDate}&endDate=${date.endDate}&limit=${limit}`)
      setPurchases(data)
    }

    getData()
  }, [date.startDate, date.endDate, limit])

  const handlePrintPurchase=async(purchaseNo, controlId, supplierId)=>{
    if(window.confirm(`print purchase ${purchaseNo}?`)){
      toast.promise(
        axios.post(`/api/print/purchase/${purchaseNo}/${controlId}/${supplierId}`,
          {},
          { responseType:"blob" }
        ).then((response)=>{
          const blob = new Blob([response.data], {type: "application/pdf"});
          const url = window.URL.createObjectURL(blob)
          window.open(url, "_blank")
        }),
        {
          pending:"...wait",
          success: "Done",
          error: "Oops try again!"
        }
      )
    }
  }

  const handlePreviewPurchase = async(purchaseNo, controlId, supplierId)=>{
    try{
      const {data} = await axios.get(`/api/purchase/${purchaseNo}/${controlId}/${supplierId}`)
      setSelectedPurchase(data)
      setShowPreview(true)
    }catch(error){
      console.error(error)
      toast.error('Failed to load purchase preview')
    }
  }


  return (
    <Container fluid>
    <h1>Purchase List</h1>
    <Row className='bg-light p-3 border'>
    <ButtonToolbar className='mb-2'>
      <Col className='col-md-2'>
        <Form.Control type='date' 
          value={date.startDate}
          onChange={(e)=> setDate(prevDate => ({...prevDate, startDate: e.target.value}))}
        />
      </Col>
      <Col className='mx-1 col-md-2'>
        <Form.Control type='date' 
          value={date.endDate}
          onChange={(e)=> setDate(prevDate => ({...prevDate, endDate: e.target.value}))}
        />
      </Col>
      <Col className='m-1 col-xs-12'>
      <Form.Control type='text' placeholder='Purchase Nō'/>
      </Col>
      <Col className='m-1'>
      <Form.Control type='text' placeholder='Purchase INV Nō'/>
      </Col>
      <Col className='m-1'>
      <Form.Control type='text' placeholder='Supplier Name'/>
      </Col>
      <Col> 
        <Form.Select>
          <option>--select--</option>
          {['paid', 'pending', 'partially Paid'].map((x)=>(
            <option key={x}>{x}</option>
          ))}
        </Form.Select>
      </Col>
      <Col>
      <Col className='m-1 col-xs-12'>
      <ButtonGroup>
      <Button size='md' variant='outline-danger'>RESET</Button>
      <Button size='md' variant='outline-warning'>SEARCH</Button>
      <XlsExportButton data={purchases}/>
      <Button size='md'>PRINT</Button>
      </ButtonGroup>
      </Col>
      </Col>
    </ButtonToolbar>
    <Row>
      <Col className='col-md-2'>
        <Form.Group>
          <Form.Select onChange={(e)=> setLimit(e.target.value)}>
            <option>--entries--</option>
            {[5, 10, 100, 150, 200, 250, 500].map((x, index)=>(
              <option key={index} value={x}>{x}</option>
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
        <Button variant='danger'>ADD PURCHASE</Button>
      </Col>
    </Row>
    </Row>

    <Table striped='columns' bordered hover responsive className='m-2 align-middle'>
      <thead>
        <tr>
          <th>#</th>
          <th>Purchase</th>
          <th>Date</th>
          <th>Supplier</th>
          <th className='text-end'>Total</th>
          <th className='text-end'>Pending</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {purchases && purchases?.map((purchase, index)=> (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>
              <Badge>{purchase.purchaseNo}</Badge>
              <div className='text-muted small'>{purchase.controlId}</div>
            </td>
            <td>{new Date(purchase.createdAt)?.toLocaleDateString()}</td>
            <td>{purchase?.supplierName}</td>
            <td className='text-end'>{round2(purchase?.totalAfterDiscount || 0).toFixed(2)}</td>
            <td className='text-end'>{formatAmount(purchase?.pendingAmount)}</td>
            <td>
              <Badge bg={purchase.status ? 'warning' : 'success'}>{purchase?.status ? 'PENDING' : 'PAID'}</Badge>
            </td>
            <td>
              <Stack gap={2} direction='horizontal'>
                <Button variant='outline-primary btn-sm' onClick={()=> handlePreviewPurchase(purchase.purchaseNo, purchase.controlId, purchase.supplierId)} title='Preview'>
                  👆
                </Button>
                <Button variant='outline-success btn-sm' onClick={()=> handlePrintPurchase(purchase.purchaseNo, purchase.controlId, purchase.supplierId)} title='Print'>
                  🖨
                </Button>
              </Stack>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
          <tr>
            <th colSpan={4}>Totals</th>
            <td className='text-end'>{round2(purchases.reduce((acc, purchase)=> acc + (purchase.totalAfterDiscount || 0), 0)).toFixed(2)}</td>
            <td className='text-end'>{round2(purchases.reduce((acc, purchase)=> acc + (purchase.pendingAmount || 0), 0)).toFixed(2)}</td>
            <td colSpan={2}></td>
          </tr>
      </tfoot>
    </Table>

    <DocumentPreview
      show={showPreview}
      onHide={()=> setShowPreview(false)}
      title="Purchase Order Preview"
      documentLabel="PURCHASE ORDER"
      company={selectedPurchase.company}
      party={{
        label: "SUPPLIER",
        name: selectedPurchase.supplier?.name,
        address: selectedPurchase.supplier?.address,
        phone: selectedPurchase.supplier?.phone,
        trn: selectedPurchase.supplier?.trn,
      }}
      documentNoLabel="Purchase No"
      documentNo={selectedPurchase.purchase?.purchaseNo}
      date={selectedPurchase.purchase?.date || selectedPurchase.purchase?.createdAt}
      details={[
        { label: "Control No", value: selectedPurchase.purchase?.controlId },
        { label: "Purchase Order No", value: selectedPurchase.purchase?.purchaseOrderNo },
        { label: "Purchase Invoice No", value: selectedPurchase.purchase?.purchaseInvNo },
      ]}
      priceLabel="P.Price"
      items={selectedPurchase.transaction?.items?.map((item) => ({
        ...item,
        price: item.purchasePrice,
      }))}
      totals={[
        { label: "Subtotal", value: selectedPurchase.purchase?.totalWithoutVat },
        { label: "Discount", value: selectedPurchase.purchase?.discountAmount },
        { label: `Tax (${selectedPurchase.purchase?.vatRate}%)`, value: selectedPurchase.purchase?.vatAmount },
        { label: "Total", value: selectedPurchase.purchase?.totalAfterDiscount, emphasize: true },
        { label: "Amount Paid", value: selectedPurchase.purchase?.paidAmount },
        { label: "Balance Due", value: selectedPurchase.purchase?.pendingAmount },
      ]}
      amountInWords={selectedPurchase.purchase?.amountInWords}
      terms={[
        "Goods received are subject to inspection and approval",
        "Please reference purchase number when paying",
      ]}
      forLabel={`FOR ${selectedPurchase.company?.name || ""}`}
      footnote="This is a system-generated Purchase Order, present control number [controlNo] for any resolutions"
    />
  </Container>
  )
}


export default PurchaseList