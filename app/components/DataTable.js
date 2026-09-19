import axios from 'axios'
import React, { useContext, useEffect, useState, useCallback } from 'react'
import { Table, Stack, Button, Form, Modal, InputGroup, ListGroup, ButtonGroup } from 'react-bootstrap'
import { createCalc, round2 } from '../dashboard/utils'
import { useStore } from '../Store'
import { toast } from 'react-toastify'

// Extracted PaymentMethodsSection component
function PaymentMethodsSection({
  advance, advanceAmount, setAdvance, setAdvanceAmount,
  cash, cashAmount, setCash, setCashAmount,
  bank, bankAmount, bankName, banks, handleBankChange, setBank, setBankAmount,
  card, cardAmount, setCard, setCardAmount
}) {
  return (
    <>
      <tr>
        <td colSpan={3}>
          <strong>Payment Methods</strong>
        </td>
      </tr>

      {/* Advance Payment */}
      <tr>
        <td colSpan={3}>
          <InputGroup className="mb-2">
            {advance && (
              <Form.Control
                type="number"
                step="0.01"
                placeholder="0.00"
                value={advanceAmount}
                onChange={e => setAdvanceAmount(Number(e.target.value))}
              />
            )}
            <InputGroup.Checkbox
              checked={advance}
              onChange={e => setAdvance(e.target.checked)}
            />
            <InputGroup.Text>Advance Amount</InputGroup.Text>
          </InputGroup>
        </td>
      </tr>

      {/* Cash Payment */}
      <tr>
        <td colSpan={3}>
          <InputGroup className="mb-2">
            {cash && (
              <Form.Control
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cashAmount}
                onChange={e => setCashAmount(Number(e.target.value))}
              />
            )}
            <InputGroup.Checkbox
              checked={cash}
              onChange={(e) => setCash(e.target.checked)}
            />
            <InputGroup.Text>Cash</InputGroup.Text>
          </InputGroup>
        </td>
      </tr>

      {/* Bank Payment */}
      <tr>
        <td colSpan={3}>
          <InputGroup className="mb-2">
            {bank && (
              <>
                <Form.Select
                  title={bankName || 'SELECT BANK'}
                  variant="danger"
                  onChange={(e) => handleBankChange(e)}
                >
                  <option>{bankName || 'select Bank'}</option>
                  {banks.map((bank) => (
                    <option key={bank.controlId} value={JSON.stringify(bank)}>
                      {bank.bankName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={bankAmount}
                  onChange={e => setBankAmount(Number(e.target.value))}
                />
              </>
            )}
            <InputGroup.Checkbox
              checked={bank}
              onChange={(e) => setBank(e.target.checked)}
            />
            <InputGroup.Text>Bank</InputGroup.Text>
          </InputGroup>
        </td>
      </tr>

      {/* Card Payment */}
      <tr>
        <td colSpan={3}>
          <InputGroup className="mb-2">
            {card && (
              <Form.Control
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cardAmount}
                onChange={e => setCardAmount(Number(e.target.value))}
              />
            )}
            <InputGroup.Checkbox
              checked={card}
              onChange={(e) => setCard(e.target.checked)}
            />
            <InputGroup.Text>Card</InputGroup.Text>
          </InputGroup>
        </td>
      </tr>
    </>
  );
}

export default function DataTable(props) {
  const { type } = props
  const { state } = useContext(useStore)
  const { userData, supplierData, customerData, companyData, saleData, purchaseData } = state

  // Initial item template
  const initialItem = {
    code: '',
    name: '',
    category: "",
    unit: "",
    description: '',
    image: '',
    qty: 0,
    vat: 0,
    salePrice: 0,
    purchasePrice: 0,
    inStock: 0,
  }

  // Main state
  const [items, setItems] = useState([])
  const [item, setItem] = useState(initialItem)

  // Payment state
  const [discount, setDiscount] = useState(0)
  const [cash, setCash] = useState(false)
  const [bank, setBank] = useState(false)
  const [card, setCard] = useState(false)
  const [advance, setAdvance] = useState(false)
  const [cashAmount, setCashAmount] = useState(0)
  const [bankAmount, setBankAmount] = useState(0)
  const [cardAmount, setCardAmount] = useState(0)
  const [advanceAmount, setAdvanceAmount] = useState(0)
  const [selectedBank, setSelectedBank] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [bankName, setBankName] = useState('')

  // VAT state
  const [vatRate, setVatRate] = useState(0.05)
  const [vatEnabled, setVatEnabled] = useState(true)

  // Search and filter state
  const [filterItems, setFilterItems] = useState([])
  const [searchTerm, setSearchTerm] = useState({})
  const [activeRow, setActiveRow] = useState(null)

  // Modal state
  const [newCategory, setNewCategory] = useState(false)
  const [newItem, setNewItem] = useState(false)

  // Data state
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [banks, setBanks] = useState([])
  const [units, setUnits] = useState([])

  // Create item modal state
  const [createItem, setCreateItem] = useState({
    name: '',
    category: "",
    purchasePrice: '',
    unit: "",
    salePrice: '',
  })

  const [category, setCategory] = useState('')

  // Add new item row
  const handleAddRow = useCallback(() => {
    setItems(prev => [...prev, { ...initialItem }])
  }, [])

  // Handle key press for adding rows
  const handleKeyPress = useCallback((e, isLastRow = false) => {
    if (e.key === 'Enter' || (e.key === 'Tab' && isLastRow)) {
      e.preventDefault()
      handleAddRow()
    }
  }, [handleAddRow])

  // Remove row
  const handleRemoveRow = useCallback((index) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index))
  }, [])

  // Save new product
  const saveNewItem = async () => {
    try {
      const { data } = await toast.promise(
        axios.post('/api/items', {
          name: createItem.name,
          purchasePrice: createItem.purchasePrice,
          salePrice: createItem.salePrice,
          category: createItem.category,
          unit: createItem.unit
        }),
        {
          pending: "Saving item...",
          success: "Item saved successfully!",
          error: "Failed to save item. Try again!"
        }
      )

      if (data) {
        setProducts(prev => [...prev, data])
        setNewItem(false)
        setCreateItem({
          name: '',
          category: "",
          purchasePrice: '',
          unit: "",
          salePrice: '',
        })
      }
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  // Upload image
  const uploadImage = async (index, file) => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const {data} = await toast.promise(
        fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        }).then((res) => res.json()),
        {
          pending: 'Uploading image...',
          success: 'Image uploaded successfully!',
          error: 'Failed to upload image. Try again.',
        }
      )

      if (data) {
        handleRowChange(index, 'image', data[0])
      } else {
        toast.error('Failed to get valid response from server')
      }
    } catch (error) {
      console.error('Error during image upload:', error)
      toast.error('Error uploading image. Please try again.')
    }
  }

  // Save new category
  const saveNewCategory = async () => {
    try {
      const { data } = await axios.post('/api/category', {
        name: category
      })

      if (data) {
        setCategories(prev => [...prev, data])
        setNewCategory(false)
        setCategory('')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Failed to save category')
    }
  }

  // Fetch initial data
  const tableData = async () => {
    try {
      const [categoriesRes, productsRes, banksRes, unitsRes] = await Promise.all([
        axios.get('/api/category'),
        axios.get('/api/items'),
        axios.get('/api/banks'),
        axios.get('/api/units')
      ])

      setCategories(categoriesRes.data)
      setProducts(productsRes.data)
      setBanks(banksRes.data)
      setUnits(unitsRes.data)
    } catch (error) {
      console.error('Error fetching table data:', error)
      toast.error('Failed to load data')
    }
  }

  // Edit row function
  const handleRowChange = useCallback((index, field, value) => {
    const isEditableField = type !== 'purchase' 
      ? ['qty', 'salePrice', 'description', 'image'].includes(field)
      : ['qty', 'purchasePrice', 'description', 'image'].includes(field)

    if (!isEditableField && !['category', 'unit'].includes(field)) return

    setItems(prevItems =>
      prevItems.map((itm, i) => {
        if (i !== index) return itm

        const updatedItem = { ...itm, [field]: value }

        // Recalculate totals if qty or price changes
        if (['qty', 'salePrice', 'purchasePrice'].includes(field)) {
          const price = type === 'purchase' ? updatedItem.purchasePrice : updatedItem.salePrice
          const unitCost = round2(updatedItem.qty * price)
          const vat = round2(unitCost * vatRate)
          const total = unitCost + vat

          return {
            ...updatedItem,
            unitCost,
            vat,
            total
          }
        }

        return updatedItem
      })
    )
  }, [type, vatRate])

  // Search product on input
  const handleSearchChange = useCallback((index, e) => {
    const value = e.target.value
    setSearchTerm(prev => ({ ...prev, [index]: value }))
    setActiveRow(index)

    if (value) {
      const filtered = products.filter(itm => 
        itm.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilterItems(filtered)
    } else {
      setFilterItems([])
      setActiveRow(null)
    }
  }, [products])

  // Select product from search
  const handleSelectItem = useCallback((index, selectedItem) => {
    setItems(prevItems =>
      prevItems.map((itm, i) => {
        if (i !== index) return itm

        const updatedItem = {
          ...itm,
          code: selectedItem.code || itm.code,
          name: selectedItem.name,
          description: selectedItem.description || '',
          image: selectedItem.image || '',
          purchasePrice: selectedItem.purchasePrice || 0,
          salePrice: selectedItem.salePrice || 0,
          qty: 1, // Default to 1 when selecting item
          inStock: selectedItem.inStock || 0,
          category: selectedItem.category || itm.category,
          unit: selectedItem.unit || itm.unit,
        }

        // Calculate totals
        const price = type === 'purchase' ? updatedItem.purchasePrice : updatedItem.salePrice
        const unitCost = round2(updatedItem.qty * price)
        const vat = round2(unitCost * vatRate)
        const total = unitCost + vat

        return {
          ...updatedItem,
          unitCost,
          vat,
          total
        }
      })
    )

    setSearchTerm(prev => ({ ...prev, [index]: selectedItem.name }))
    setFilterItems([])
    setActiveRow(null)
  }, [type, vatRate])

  // Handle category change
  const handleCategoryChange = useCallback((index, value) => {
    handleRowChange(index, 'category', value)
  }, [handleRowChange])

  // Handle bank change
  const handleBankChange = useCallback((e) => {
    const selectedBank = JSON.parse(e.target.value)
    setSelectedBank(selectedBank)
    setBankName(selectedBank.bankName)
  }, [])

  // Effects
  useEffect(() => {
    tableData()
  }, [])

  useEffect(() => {
    if (bank) {
      setPaymentMethod("bank")
    } else if (cash) {
      setPaymentMethod("cash")
    } else if (card) {
      setPaymentMethod("card")
    }
  }, [cash, card, bank])

  // Calculator
  const calculator = createCalc({
    vatEnabled, vatRate, discount,
    cash, bank, card, cashAmount,
    bankAmount, cardAmount,
    advanceAmount, items
  })

  const calculatedValues = {
    pendingAmount: calculator.pendingAmount().toFixed(2),
    vatAmount: calculator.vatAmount().toFixed(2),
    totalWithoutVat: calculator.totalWithoutVat().toFixed(2),
    totalAfterDiscount: calculator.totalAfterDiscount().toFixed(2),
    itemsWithVatTotal: calculator.itemsGrossTotal().toFixed(2),
    discountAmount: calculator.discountAmount().toFixed(2),
    advanceTotal: calculator.advanceAmount().toFixed(2),
    paidAmount: calculator.paidAmount().toFixed(2),
    grandTotal: calculator.grandTotal().toFixed(2)
  }

  // Prepare data based on type
  const getDataForType = useCallback((type) => {
    const baseData = {
      vatRate, discount, cashAmount, bankAmount,
      vatEnabled, bankName, cardAmount, advanceAmount,
      items, ...calculatedValues
    }

    const typeSpecificData = {
      purchase: {
        supplier: supplierData,
        employee: userData,
        paymentMethod,
        bankName,
        purchaseInvDate: JSON.parse(localStorage.getItem('purchaseInvDate') || 'null'),
        purchaseOrderNo: JSON.parse(localStorage.getItem('purchaseOrderNo') || 'null'),
        purchaseInvNo: JSON.parse(localStorage.getItem('purchaseInvNo') || 'null'),
      },
      sales: {
        customer: customerData,
        employee: userData,
        paymentMethod,
        bankName,
        date: JSON.parse(localStorage.getItem('invDate') || 'null'),
        deliveryNote: JSON.parse(localStorage.getItem('deliveryNote') || 'null'),
        purchaseOrderNumber: JSON.parse(localStorage.getItem('purchaseOrder') || 'null')
      },
      quotation: {
        customer: customerData,
        employee: userData,
      },
      return: {
        sale: saleData,
        purchase: purchaseData,
        employee: userData,
      },
      deliveryNote: {
        customer: customerData,
        employee: userData
      },
      invoice: {
        companyInfo: companyData,
        paymentMethod,
        bankName,
        date: JSON.parse(localStorage.getItem('invDate') || 'null')
      }
    }

    return { ...baseData, ...(typeSpecificData[type] || {}) }
  }, [vatRate, discount, cashAmount, bankAmount, vatEnabled, bankName, cardAmount, advanceAmount, items, calculatedValues, supplierData, userData, paymentMethod, customerData, saleData, purchaseData, companyData])

  // Save and print handlers
  const saveData = async (type, data) => {
    try {
      await axios.post(`/api/${type}/save`, { data })
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Failed to save')
    }
  }

  // With responseType: "blob", axios stores an error response body as a Blob
  // too (even a JSON error from the server) rather than parsing it — so a
  // failure has to be decoded back to text before we can show the real reason.
  const extractPdfErrorMessage = async (error) => {
    const responseData = error?.response?.data
    if (responseData instanceof Blob) {
      try {
        const text = await responseData.text()
        const parsed = JSON.parse(text)
        return parsed.message || parsed.error || null
      } catch {
        return null
      }
    }
    return responseData?.message || null
  }

  const saveAndPrint = async (type, data) => {
    try {
      const response = await axios.post(`/api/${type}`, { data }, { responseType: "blob" })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")

      // Clear localStorage
      const keysToRemove = ['invDate', 'deliveryNote', 'purchaseOrder', 'purchaseOrderNo', 'purchaseInvNo']
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error("Error rendering PDF", error)
      const message = await extractPdfErrorMessage(error)
      throw new Error(message || 'Failed to generate PDF')
    }
  }

  const handleSave = async (action) => {
    if (items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    const preparedData = getDataForType(type)

    const actions = {
      SAVE: () => saveData(type, preparedData),
      SAVE_AND_PRINT: () => saveAndPrint(type, preparedData)
    }

    if (actions[action]) {
      toast.promise(
        actions[action](),
        {
          pending: "Processing...",
          success: "Operation completed successfully!",
          error: {
            render({ data: err }) {
              return err?.message || "Operation failed. Please try again!"
            }
          }
        }
      )
    }
  }

  return (
    <>
      <Table striped bordered hover className='my-3' responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Category</th>
            <th>Item</th>
            <th>Unit</th>
            <th>Qty</th>
            <th>Image</th>
            <th>P.Price</th>
            <th>S.Price</th>
            <th>Cost</th>
            <th>VAT</th>
            <th>Total Incl.VAT</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((itm, index) => {
            const isLastRow = index === items.length - 1
            
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {itm.category ? (
                    <Form.Control type='text' value={itm.category} readOnly />
                  ) : (
                    <Form.Select 
                      name='category'
                      onChange={(e) => handleCategoryChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, isLastRow)}
                    >
                      <option>{itm.category || 'Select Category'}</option>
                      {categories.map((cat, catIndex) => (
                        <option key={catIndex} value={cat.name}>{cat.name}</option>
                      ))}
                    </Form.Select>
                  )}
                </td>
                <td>
                  <Stack gap={2}>
                    <Form.Control
                      type="text"
                      value={searchTerm[index] || ""}
                      onChange={(e) => handleSearchChange(index, e)}
                      onKeyDown={(e) => handleKeyPress(e, isLastRow)}
                      placeholder="Item Name"
                    />
                    {activeRow === index && filterItems.length > 0 && (
                      <ListGroup
                        style={{ 
                          zIndex: 1000, 
                          maxHeight: '200px', 
                          overflowY: "auto", 
                          background: "white",
                          position: 'absolute',
                          width: '100%'
                        }}
                      >
                        {filterItems.map((filteredItem) => (
                          <ListGroup.Item
                            key={filteredItem.code}
                            onClick={() => handleSelectItem(index, filteredItem)}
                            style={{ cursor: 'pointer' }}
                          >
                            {filteredItem.name}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                    <Form.Control
                      as='textarea'
                      value={itm.description || ''}
                      onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, isLastRow)}
                      placeholder="Description"
                      rows={2}
                    />
                  </Stack>
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    value={itm.unit || ''}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={itm.qty || 0}
                    onChange={(e) => handleRowChange(index, 'qty', Number(e.target.value))}
                    onKeyDown={(e) => handleKeyPress(e, isLastRow)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="file"
                    onChange={(e) => uploadImage(index, e.target.files[0])}
                    accept="image/*"
                  />
                  {itm.image && (
                    <img 
                      src={itm.image} 
                      height={60} 
                      width={60} 
                      alt="Item" 
                      className='img-thumbnail mt-1' 
                    />
                  )}
                </td>
                <td>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={itm.purchasePrice || 0}
                    onChange={(e) => handleRowChange(index, 'purchasePrice', Number(e.target.value))}
                    onKeyDown={(e) => handleKeyPress(e, isLastRow)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={itm.salePrice || 0}
                    onChange={(e) => handleRowChange(index, 'salePrice', Number(e.target.value))}
                    onKeyDown={(e) => handleKeyPress(e, isLastRow)}
                  />
                </td>
                <td>{itm.unitCost?.toFixed(2) || '0.00'}</td>
                <td>{round2(itm.vat || 0)}</td>
                <td>{itm.total?.toFixed(2) || '0.00'}</td>
                <td>
                  <Button 
                    variant='outline-danger' 
                    size="sm"
                    onClick={() => handleRemoveRow(index)}
                    title="Remove row"
                  >
                    ✕
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          {/* Summary Section */}
          <tr className="table-secondary">
            <th colSpan={12} className="text-center">
              <strong>Totals Summary</strong>
            </th>
          </tr>

          {/* Amount Breakdown */}
          <tr>
            <td colSpan={12}>
              <div className="d-flex justify-content-between">
                <span>Items Total Incl VAT:</span>
                <strong>AED {calculatedValues.itemsWithVatTotal}</strong>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={12}>
              <div className="d-flex justify-content-between">
                <span>Items Total Excl VAT:</span>
                <strong>AED {calculatedValues.totalWithoutVat}</strong>
              </div>
            </td>
          </tr>

          {/* Discount Input */}
          <tr>
            <td colSpan={12}>
              <InputGroup>
                <InputGroup.Text>Discount</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Discount Amount"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                />
              </InputGroup>
            </td>
          </tr>

          {/* VAT Toggle */}
          <tr>
            <td colSpan={12}>
              <InputGroup>
                {vatEnabled && (
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={vatRate}
                    onChange={e => setVatRate(Number(e.target.value))}
                    placeholder="VAT Rate"
                  />
                )}
                <InputGroup.Checkbox
                  checked={vatEnabled}
                  onChange={e => setVatEnabled(e.target.checked)}
                />
                <InputGroup.Text>VAT Applied: {(vatRate * 100).toFixed(1)}%</InputGroup.Text>
              </InputGroup>
            </td>
          </tr>

          {/* Calculated Totals */}
          <tr>
            <td colSpan={12}>
              <div className="d-flex justify-content-between">
                <span>Total After Discount:</span>
                <strong>AED {calculatedValues.totalAfterDiscount}</strong>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={12}>
              <div className="d-flex justify-content-between">
                <span>VAT Amount:</span>
                <strong>AED {calculatedValues.vatAmount}</strong>
              </div>
            </td>
          </tr>
          <tr className="table-warning">
            <td colSpan={12}>
              <div className="d-flex justify-content-between">
                <span><strong>Grand Total:</strong></span>
                <strong>AED {calculatedValues.grandTotal}</strong>
              </div>
            </td>
          </tr>

          {/* Payment Methods */}
          <PaymentMethodsSection
            advance={advance}
            advanceAmount={advanceAmount}
            setAdvance={setAdvance}
            setAdvanceAmount={setAdvanceAmount}
            cash={cash}
            cashAmount={cashAmount}
            setCash={setCash}
            setCashAmount={setCashAmount}
            bank={bank}
            bankAmount={bankAmount}
            bankName={bankName}
            banks={banks}
            handleBankChange={handleBankChange}
            setBank={setBank}
            setBankAmount={setBankAmount}
            card={card}
            cardAmount={cardAmount}
            setCard={setCard}
            setCardAmount={setCardAmount}
          />

          {/* Payment Summary */}
          <tr>
            <td colSpan={12}>
              <div className="d-flex justify-content-between">
                <span>Total Paid Amount:</span>
                <strong className="text-success">AED {calculatedValues.paidAmount}</strong>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={12}>
              <div className="d-flex justify-content-between">
                <span>Total Pending Amount:</span>
                <strong className="text-danger">AED {calculatedValues.pendingAmount}</strong>
              </div>
            </td>
          </tr>

          {/* Action Buttons */}
          <tr>
            <td colSpan={12}>
              <div className="d-flex justify-content-between align-items-center">
                <ButtonGroup>
                  <Button variant="info" onClick={() => setNewItem(true)}>
                    New Item
                  </Button>
                  <Button variant="secondary" onClick={() => setNewCategory(true)}>
                    New Category
                  </Button>
                  <Button variant="warning" onClick={handleAddRow}>
                    Add Row ➕
                  </Button>
                </ButtonGroup>

                <ButtonGroup>
                  <Button
                    variant="primary"
                    disabled={type === 'return' || items.length === 0}
                    onClick={() => window.confirm('Save & Print Now?') && handleSave('SAVE_AND_PRINT')}
                  >
                    Save & Print 🖨️
                  </Button>
                  <Button
                    variant="success"
                    disabled={items.length === 0}
                    onClick={() => window.confirm('Save data?') && handleSave('SAVE')}
                  >
                    Save 💾
                  </Button>
                  <Button
                    variant="danger"
                    disabled={items.length === 0}
                    onClick={() => window.confirm('Clear all data?') && setItems([])}
                  >
                    Clear All
                  </Button>
                </ButtonGroup>
              </div>
            </td>
          </tr>
        </tfoot>
      </Table>

      {/* New Category Modal */}
      <Modal show={newCategory} onHide={() => setNewCategory(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control 
            type='text' 
            placeholder='Category name'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveNewCategory()}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setNewCategory(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={saveNewCategory}
            disabled={!category.trim()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Product Modal */}
      <Modal show={newItem} onHide={() => setNewItem(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Item (Product)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack gap={3}>
            <Form.Control
              placeholder='Product name'
              value={createItem.name}
              type='text' 
              onChange={(e) => setCreateItem(prev => ({ ...prev, name: e.target.value }))}
            />
            <Form.Control
              placeholder='Purchase price'
              value={createItem.purchasePrice}
              type='number'
              step='0.01'
              onChange={(e) => setCreateItem(prev => ({ ...prev, purchasePrice: e.target.value }))}
            />
            <Form.Control
              placeholder='Sale price'
              value={createItem.salePrice}
              type='number'
              step='0.01'
              onChange={(e) => setCreateItem(prev => ({ ...prev, salePrice: e.target.value }))}
            />
            <Form.Select
              value={createItem.category || ''}
              onChange={(e) => setCreateItem(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.code || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
            <Form.Select 
              value={createItem.unit || ''}
              onChange={(e) => setCreateItem(prev => ({ ...prev, unit: e.target.value }))}
            >
              <option value="">Select Unit</option>
              {units.map((unit) => (
                <option key={unit.code || unit.name} value={unit.name}>
                  {unit.name}
                </option>
              ))}
            </Form.Select>
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setNewItem(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={saveNewItem}
            disabled={!createItem.name.trim() || !createItem.category || !createItem.unit}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}