'use client'

///THIS IS SUPPOSED TO BE DEPENDANT ON
// PURCHASE ORDER OR ENQUIRIES IN THE DATABASE DESIGN

import DataTable from '@/app/components/DataTable'
import { useStore } from '@/app/Store'
import axios from 'axios'
import debounce from 'lodash.debounce'
import React, { useRef, useContext, useEffect, useState, useCallback } from 'react'
import { InputGroup, Form, Row, Col, Card, Button, Accordion, ListGroup, Spinner, Badge } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { FaSearch, FaTimes, FaUserCircle, FaCheckCircle, FaSave, FaEraser, FaFileInvoice, FaUser } from 'react-icons/fa'



export default function PurchasePage() {

  const emptySupplier = {
    name: "",
    mobile: "",
    phone: "",
    email:"",
    address: "",
    description:"",
    trn:""
  }

  const [supplier, setSupplier] = useState(emptySupplier)

  const [file, setFile] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [suppliers, setSuppliers ] = useState([])
  const [searching, setSearching] = useState(false)
  const [savingSupplier, setSavingSupplier] = useState(false)
  const [purchaseInvNo, setPurchaseInvNo] = useState('')
  const [purchaseOrderNo, setPurchaseOrderNo] = useState('')
  const [invDate, setInvDate] = useState(new Date())



  const {state, dispatch: ctxDispatch} = useContext(useStore)
  const {userData} = state
  const dropDownRef = useRef(null)


  ///POST REQUEST TO SAVE NEW SUPPLIER FROM DROPDOWN
  const saveNewSupplier = async(e)=>{
    e.preventDefault()
    setSavingSupplier(true)

    try{
      const { data } = await axios.post('/api/supplier', {
        name: supplier.name,
        mobile: supplier.mobile,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        description: supplier.description,
        trn: supplier.trn
      })

      if(data && window.confirm('use new supplier data?')){
        ctxDispatch({type:"SAVE_SUPPLIER", payload: data})
        setSupplier(data)
        toast.success('Supplier saved successfully')
      }else{
        setSupplier(emptySupplier)
      }
    }catch(error){
      console.log(error)
      toast.error('Failed to save supplier. Please try again.')
    }finally{
      setSavingSupplier(false)
    }

  }


  const searchSupplier = async (searchKey) => {
    setSearching(true)
    try {
      const searchData = await axios.get(`/api/supplier/search`, {
        params: { searchKey: searchKey.toString() }, // Send searchKey as a query parameter
      });
      setSuppliers(searchData.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to search suppliers')
    } finally {
      setSearching(false)
    }
  };

  const debounceSearch = useCallback(debounce((searchKey)=>{
    searchSupplier(searchKey)
  }, 500), [])

  const handleDateChange=(e)=>{
    const dateStr = e.target.value;
    setInvDate(dateStr)
    localStorage.setItem('purchaseInvDate', JSON.stringify(dateStr))
  }

  const clearSelectedSupplier = () => {
    setSupplier(emptySupplier)
    ctxDispatch({type:"SAVE_SUPPLIER", payload: emptySupplier})
  }

  useEffect(()=>{
    if(searchKey){
      debounceSearch(searchKey)
    }else{
      setSuppliers([])
      setSearching(false)
    }


    //clean up function
    return ()=> debounceSearch.cancel()
  }, [searchKey, debounceSearch])



  return (
    <div className='p-3 p-md-4'>
      <div className='d-flex align-items-center justify-content-between mb-4'>
        <div>
          <h1 className='h3 mb-1'>Purchase</h1>
          <p className='text-muted mb-0'>Record a new purchase order from a supplier</p>
        </div>
      </div>

      <Row className='g-3'>
        <Col xs={12} md={6} xl={4}>
          <Card className='shadow-sm h-100'>
            <Card.Header className='bg-white'>
              <Card.Title className='mb-0 fs-6 d-flex align-items-center gap-2'>
                <FaSearch className='text-muted' /> Search Supplier
              </Card.Title>
            </Card.Header>
            <Card.Body className='position-relative'>
              {supplier?.name ? (
                <div className='d-flex align-items-center justify-content-between border rounded p-2 mb-3 bg-light'>
                  <div className='d-flex align-items-center gap-2 text-truncate'>
                    <FaCheckCircle className='text-success flex-shrink-0' />
                    <div className='text-truncate'>
                      <div className='fw-semibold text-truncate'>{supplier.name}</div>
                      {supplier.mobile && <small className='text-muted'>{supplier.mobile}</small>}
                    </div>
                  </div>
                  <Button variant='link' size='sm' className='text-danger p-0 ms-2' onClick={clearSelectedSupplier} title='Remove selected supplier'>
                    <FaTimes />
                  </Button>
                </div>
              ) : (
                <Badge bg='secondary-subtle' text='dark' className='mb-3 d-inline-block'>No supplier selected yet</Badge>
              )}

              <InputGroup aria-describedby='addon'>
                <InputGroup.Text className='bg-white'><FaSearch className='text-muted' /></InputGroup.Text>
                <Form.Control
                  type='text'
                  placeholder='Search by name, TRN or mobile...'
                  value={searchKey}
                  onChange={(e)=> setSearchKey(e.target.value)}
                />
                {searchKey && (
                  <Button variant='outline-secondary' onClick={()=>{
                    setSearchKey('')
                    setSuppliers([])
                  }}>
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>

              {searching && (
                <div className='d-flex align-items-center gap-2 text-muted mt-2 small'>
                  <Spinner animation='border' size='sm' /> Searching suppliers...
                </div>
              )}

              {!searching && searchKey && suppliers.length === 0 && (
                <div className='text-muted small mt-2'>No suppliers found for &ldquo;{searchKey}&rdquo;.</div>
              )}

              {suppliers && suppliers.length > 0 &&(
                <ListGroup ref={dropDownRef} as='ul' className='position-absolute w-100 shadow-sm'
                  style={{ left: 0, top: '100%', border: '1px solid #dee2e6', maxHeight: '220px', overflowY: 'auto', cursor:"pointer", zIndex:100}}>
                  {suppliers.map((supp)=>(
                    <ListGroup.Item key={supp._id} as='li' action onClick={(e)=> {
                      e.preventDefault()
                      setSupplier(supp)
                      ctxDispatch({type:"SAVE_SUPPLIER", payload: supp})
                      setSuppliers([])
                      setSearchKey('')
                    }}>
                      <div className='d-flex align-items-center gap-2'>
                        <FaUserCircle className='text-muted' />
                        <div>
                          <div className='fw-semibold'>{supp.name}</div>
                          {supp.mobile && <small className='text-muted'>{supp.mobile}</small>}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} xl={4}>
          <Card className='shadow-sm h-100'>
            <Accordion defaultActiveKey='0'>
              <Accordion.Item eventKey='0' className='border-0'>
                <Accordion.Header>
                  <span className='d-flex align-items-center gap-2'>
                    <FaUser className='text-muted' />
                    {supplier?.name || 'Create Supplier'}
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  <Form onSubmit={saveNewSupplier}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Name <span className='text-danger'>*</span></Form.Label>
                      <Form.Control type='text' required
                        value={supplier.name || ''}
                        onChange={(e)=>{
                          setSupplier((prevState)=> ({...prevState, name: e.target.value}))
                        }}
                      />
                    </Form.Group>
                    <Row className='g-2'>
                      <Col xs={12} sm={6}>
                        <Form.Group className='mb-3'>
                          <Form.Label>TRN</Form.Label>
                          <Form.Control type='text'
                            value={supplier.trn || ''}
                            onChange={(e)=>{
                              setSupplier((prevState)=> ({...prevState, trn: e.target.value}))
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Group className='mb-3'>
                          <Form.Label>Mobile</Form.Label>
                          <Form.Control type='text'
                            value={supplier.mobile || ''}
                            onChange={(e)=> {
                              setSupplier((prevState)=> ({...prevState, mobile: e.target.value}))
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Group className='mb-3'>
                          <Form.Label>Phone</Form.Label>
                          <Form.Control type='text'
                            value={supplier.phone || ''}
                            onChange={(e)=>{
                              setSupplier((prevState)=> ({...prevState, phone: e.target.value}))
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Group className='mb-3'>
                          <Form.Label>Supplier Email</Form.Label>
                          <Form.Control type='email'
                            value={supplier.email || ''}
                            onChange={(e)=>{
                              setSupplier((prevState)=> ({...prevState, email: e.target.value}))
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className='mb-3'>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as='textarea' rows={2}
                        placeholder='Supplier location / address here...'
                          value={supplier.address || ''}
                          onChange={(e)=>{
                            setSupplier((prevState)=> ({...prevState, address: e.target.value}))
                          }}
                      />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as='textarea' rows={3}
                        placeholder='Write something here...'
                          value={supplier.description || ''}
                          onChange={(e)=>{
                            setSupplier((prevState)=> ({...prevState, description: e.target.value}))
                          }}
                      />
                    </Form.Group>
                    <div className='d-flex gap-2'>
                      <Button type='submit' variant='primary' disabled={savingSupplier || !supplier.name}>
                        {savingSupplier ? (
                          <><Spinner animation='border' size='sm' className='me-2' />Saving...</>
                        ) : (
                          <><FaSave className='me-2' />Save Supplier</>
                        )}
                      </Button>
                      <Button variant='outline-secondary' onClick={()=>{
                        setSupplier(emptySupplier)
                      }}>
                        <FaEraser className='me-2' />Clear
                      </Button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card>
        </Col>

        <Col xs={12} xl={4}>
          <Card className='shadow-sm h-100'>
            <Accordion defaultActiveKey='0'>
              <Accordion.Item eventKey='1' className='border-0'>
                <Accordion.Header>
                  <span className='d-flex align-items-center gap-2'>
                    <FaFileInvoice className='text-muted' /> Purchase Details
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  <Form>
                    <Form.Group className='mb-3'>
                      <Form.Label>Supplier TRN</Form.Label>
                      <Form.Control type='text' value={supplier?.trn || ''} placeholder='No TRN on file' disabled/>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Purchase Date</Form.Label>
                      <Form.Control type='date' onChange={handleDateChange} value={invDate}/>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Purchase Order Number</Form.Label>
                      <Form.Control type='text'
                        placeholder='e.g. PO-00123'
                        value={purchaseOrderNo}
                        onChange={(e)=>{
                          const text = e.target.value;
                          setPurchaseOrderNo(text)
                          if(text){
                            localStorage.setItem('purchaseOrderNo', JSON.stringify(text))
                          }
                        }}
                      />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                      <Form.Label>Purchase Invoice Number</Form.Label>
                      <Form.Control type='text'
                        placeholder='e.g. INV-00456'
                        value={purchaseInvNo}
                        onChange={(e)=>{
                          const text = e.target.value
                          setPurchaseInvNo(text)
                          if(text){
                            localStorage.setItem('purchaseInvNo', JSON.stringify(text))
                          }
                        }}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Logged In User</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaUser /></InputGroup.Text>
                        <Form.Control type='text'
                          value={userData?.username || ''} disabled/>
                      </InputGroup>
                    </Form.Group>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card>
        </Col>
      </Row>

      <div className='mt-4'>
        <DataTable type={'purchase'}/>
      </div>
    </div>
  )
}
