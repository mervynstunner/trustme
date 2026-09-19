'use client'

import React, {useContext, useEffect, useState} from 'react'
import { MdSpaceDashboard } from "react-icons/md";
import {
  FaQuestionCircle,
  FaTruckLoading,
  FaFileInvoice,
  FaCashRegister,
  FaMoneyCheckAlt,
  FaShoppingCart,
  FaUserTie,
  FaCalendarCheck,
  FaUsers,
  FaIndustry,
  FaUndoAlt,
  FaBoxes,
  FaBalanceScale,
  FaWarehouse,
  FaChartLine,
  FaChartBar,
  FaUserShield,
  FaChevronDown,
} from "react-icons/fa";
import { Container, Row, Col, Button, Navbar, Offcanvas, ListGroup, Accordion, Nav, ButtonGroup, Badge, Collapse} from 'react-bootstrap'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../Store';
import axios from 'axios';
import { toast } from 'react-toastify';

const groupOrder = ["Overview", "Transactions", "Finance", "Contacts", "Inventory", "Reports", "Administration"]

const DashboardLayout = ({children}) => {

  const [show, setShow] = useState(true)
  const [openGroups, setOpenGroups] = useState(() => new Set())
  const [companyProfileComplete, setCompanyProfileComplete] = useState(true)

  const {state, dispatch: ctxDispatch} = useContext(useStore)

  useEffect(() => {
    if (!state.userData) return
    axios.get('/api/company')
      .then(({ data }) => setCompanyProfileComplete(data?.profileComplete !== false))
      .catch((error) => console.error('Failed to load company profile status:', error))
  }, [state.userData])

  const toggle =()=> setShow(!show)

  const toggleGroup = (group) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      next.has(group) ? next.delete(group) : next.add(group)
      return next
    })
  }

  const getData =()=>{
    console.log('data')
  }

  const router = useRouter()

  const logOutUser =()=>{
    ctxDispatch({type: 'LOG_OUT'})
    localStorage.removeItem('userData')
    router.replace('/')
  }


const printLetterHead = async (e) => {
  // Function to print the letter head
  e.preventDefault()
  window.confirm('print Company Letter Head?') &&
  toast.promise(
    axios.post(`/api/print/letterhead`, {}, {responseType: "blob"})
    .then(response => {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    }),
    {
      pending: 'Printing...',
      success: 'Letter head printed!',
      error: 'Failed to print letter head'
    }
  );
}

  const menu = [
      {
        title:"Dashboard",
        group:"Overview",
        icon: <MdSpaceDashboard/>,
        links:[{name:"Overview", href:"/"}]
      },
      {
        title:"Enquiry",
        group:"Transactions",
        icon: <FaQuestionCircle/>,
        links:[
          {name:"Enquiries", href:"/dashboard/Enquiry/Enquiries" },
          {name:"Enquiries List", href:"/dashboard/Enquiry/EnquiriesList" }
      ]
      },
      {
        title:"Quotations",
        group:"Transactions",
        icon: <FaFileInvoice/>,
        links:[
          { name:"Quotations", href:"/dashboard/Quotation/Quotations"},
          { name:"Quotations From Enqury", href: "/dashboard/Quotation/EnquiryQuotations"},
          { name:"Quotations List", href: "/dashboard/Quotation/QuotationsList"}
        ]
      },
      {
        title:"Sales",
        group:"Transactions",
        icon: <FaCashRegister/>,
        links:[
          { name:"Sales", href:  "/dashboard/Sales"},
          { name:"Sales List", href:  "/dashboard/Sales/SalesList"}
      ]
      },
      {
        title:"Purchase",
        group:"Transactions",
        icon: <FaShoppingCart/>,
        links:[
          {name:"purchase", href:"/dashboard/Purchase/Purchase"},
          {name:"purchase List", href:"/dashboard/Purchase/PurchaseList"},
        ]
      },
      {
        title:"Delivery Note",
        group:"Transactions",
        icon: <FaTruckLoading/>,
        links:[
          {name:"Delivery Note", href:"/dashboard/DeliveryNote" },
          {name:"Delivery Notes List", href:"/dashboard/DeliveryNote/DeliveryNoteList" }
      ]
      },
      {
        title:"Returns",
        group:"Transactions",
        icon: <FaUndoAlt/>,
        links:[
          {name:"Returns", href:"/dashboard/Returns/Returns"},
          {name:"Customer Return List", href:"/dashboard/Returns/CustomerReturnList"},
          {name:"Supplier Return List", href:"/dashboard/Returns/SupplierReturnList"},
        ]
      },
      {
        title:"Cheque",
        group:"Finance",
        icon: <FaMoneyCheckAlt/>,
        links:[
          { name:"Add Check Banks", href:"/dashboard/Cheque/AddChequeBanks"},
          { name:"Banks List", href:"/dashboard/Cheque/BanksList"},
          { name:"Invoice Cheque List", href:"/dashboard/Cheque/InvoiceChequeList"},
          { name:"Purchase Cheque List", href:"/dashboard/Cheque/PurchaseChequeList"},

        ]
      },
      {
        title:"Account",
        group:"Finance",
        icon: <FaBalanceScale/>,
        links:[
          {name:"Profit and Loss", href:"/dashboard/Account/ProfitAndLoss"},
          {name:"Trading And Profit And Loss", href:"/dashboard/Account/TradingProfitAndLoss"},
          {name:"Balance Sheet", href:"/dashboard/Account/BalanceSheet"},
          {name:"Trial Balance Sheet", href:"/dashboard/Account/TrialBalanceReport"},
          {name:"Customer Recive", href:"/dashboard/Account/CustomerRecieve"},
          {name:"Supplier Payment", href:"/dashboard/Account/SupplierPayment"},
          {name:"Bank Transactions", href:"/dashboard/Account/BankTransactions"},
          {name:"Add Expenses", href:"/dashboard/Account/AddExpenses"},
        ]
      },
      {
        title:"Customer",
        group:"Contacts",
        icon: <FaUsers/>,
        links:[
          {name:"Add Customer", href:"/dashboard/Customer/AddCustomer"},
          {name:"Customer List", href:"/dashboard/Customer/CustomerList"},
          {name:"Leads List", href:"/dashboard/Customer/LeadsList"},
          {name:"Customer Advance", href:"/dashboard/Customer/CustomerAdvance"},
          {name:"Customer Ledger", href:"/dashboard/Customer/CustomerLedger"},
        ]
      },
      {
        title:"Supplier",
        group:"Contacts",
        icon: <FaIndustry/>,
        links:[
          { name:"Add Supplier", href:"/dashboard/Supplier/AddSupplier"},
          { name:"Supplier List", href:"/dashboard/Supplier/SupplierList"},
          { name:"Supplier Advance", href:"/dashboard/Supplier/SupplierAdvance"},
          { name:"Supplier Ledger", href:"/dashboard/Supplier/SupplierLedger"},
        ]
      },
      {
        title:"Employee",
        group:"Contacts",
        icon: <FaUserTie/>,
        links:[
          {name:"Add Employee", href:"/dashboard/Employee/AddEmployee"},
          {name:"Employee List", href:"/dashboard/Employee/EmployeeList"},
        ]
      },
      {
        title:"Employee Attendance",
        group:"Contacts",
        icon: <FaCalendarCheck/>,
        links:[
          {name:"Record Daily Attendance", href:"/dashboard/EmployeeAttendance/RecordDaliyAttendance"},
          {name:"Attendance Report", href:"/dashboard/EmployeeAttendance/AttendanceReport"},
          {name:"Record Employee Leave", href:"/dashboard/EmployeeAttendance/EmployeeLeave"},
          {name:"Leave Report", href:"/dashboard/EmployeeAttendance/LeaveReport"},
        ]
      },
      {
        title:"Master",
        group:"Inventory",
        icon: <FaBoxes/>,
        links:[
          {name:"Item List", href:"/dashboard/Master/ItemsList"},
          {name:"Unit List", href:"/dashboard/Master/UnitsList"},
          {name:"Category List", href:"/dashboard/Master/CategoryList"},
          {name:"Ledger", href:"/dashboard/Master/Ledger"},
        ]
      },
      {
        title:"Stock Rport",
        group:"Inventory",
        icon: <FaWarehouse/>,
        links:[
          {name:"Report", href:"/dashboard/StockReport/Report"},
        ]
      },
      {
        title:"Purchase Report",
        group:"Reports",
        icon: <FaChartLine/>,
        links:[
          { name:"Item Purchase Report", href:"/dashboard/PurchaseReport/ItemPurchaseReport"},
        ]
      },
      {
        title:"Reports",
        group:"Reports",
        icon: <FaChartBar/>,
        links:[
          {name:"Customer Ledger", href:"/dashboard/Reports/CustomerLedger"},
          {name:"Customer Advance Ledger", href:"/dashboard/Reports/CustomerAdvanceLedger"},
          {name:"Supplier Ledger", href:"/dashboard/Reports/SupplierLedger"},
          {name:"Supplier Advance Ledger", href:"/dashboard/Reports/SupplierAdvanceLedger"},
          {name:"Cash Ledger", href:"/dashboard/Reports/CashLedger"},
          {name:"Bank Ledger", href:"/dashboard/Reports/BankLedger"},
          {name:"Card Ledger", href:"/dashboard/Reports/CardLedger"},
          {name:"Vat Ledger", href:"/dashboard/Reports/VatLedger"},
          {name:"Sales Vat Ledger", href:"/dashboard/Reports/SalesVatLedger"},
          {name:"Purchase Vat Ledger", href:"/dashboard/Reports/PurchaseVatLedger"},
          {name:"Expense Vat Ledger", href:"/dashboard/Reports/ExpenseVatLedger"},
          {name:"Customer Recieve List", href:"/dashboard/Reports/CustomerRecieveList"},
          {name:"Supplier Payment List", href:"/dashboard/Reports/SupplierPaymentList"},
          {name:"Company Expenses List", href:"/dashboard/Reports/CompanyExpenseList"},
          {name:"Daily Report", href:"/dashboard/Reports/DailyReport"},
          {name:"Sales & Purchase Report", href:"/dashboard/Reports/SalesAndPurchaseReport"},
          {name:"User Wise Sales Report", href:"/dashboard/Reports/UserSalesReport"},
          {name:"Product Sale Report", href:"/dashboard/Reports/SaleReportProductWise"},
          {name:"Product Purchase Report", href:"/dashboard/Reports/PurchaseReportProductWise"},
          {name:"Product Sale Return Report", href:"/dashboard/Reports/SaleReturnReportProduct"},
          {name:"Product purchase Return Report", href:"/dashboard/Reports/PurchaseReturnReportProduct"},
          {name:"Docs Expiry List", href:"/dashboard/Reports/DocsExpiryList"},
        ]
      },
      {
        title:"Admin",
        group:"Administration",
        icon: <FaUserShield/>,
        links:[
          {name:"Manage Users", href:"/dashboard/Admin/ManageUsers"},
          {name:"Add Bank Accounts", href:"/dashboard/Admin/AddBankAccount"},
          {name:"Manage Company", href:"/dashboard/Admin/ManageCompany"},
        ]
      },

    ]

  const groupedMenu = groupOrder
    .map((group) => ({ group, items: menu.filter((item) => item.group === group) }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="min-h-screen">
      <Navbar bg="light" data-bs-theme="light" className="border-bottom fixed-top">
        <Container fluid>
          <Navbar.Brand>
            <Button variant="outline-primary" onClick={toggle}>
              ☰
            </Button>
          </Navbar.Brand>
          <ButtonGroup className='border rounded shadow-sm'>
            <Button variant='light border border-dark' onClick={printLetterHead}>
              📄 Letter
            </Button>
            <Button variant='light border border-dark'>
              ✉️ <Badge pill className='bg-info'>9</Badge>
              <span className='visually-hidden'>Notifications</span>
            </Button>
          <Button variant='outline-danger' onClick={logOutUser}>
              ⏏️ Logout
          </Button>
          </ButtonGroup>
        </Container>
      </Navbar>

      <aside>
        <Offcanvas 
          show={show}
          onHide={toggle}
          scroll={true}
          backdrop={false}
          placement="start"
          style={{ marginTop: '70px', width: '280px'}}
        >
          <Offcanvas.Header closeButton>
          <Offcanvas.Title>Dashboard</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className='p-0'>
            {groupedMenu.map((section, sectionIndex) => {
              const isOpen = openGroups.has(section.group)
              return (
                <div key={sectionIndex} className='mb-1 border-bottom'>
                  <button
                    type='button'
                    onClick={() => toggleGroup(section.group)}
                    className='d-flex align-items-center justify-content-between w-100 px-3 py-2 bg-transparent border-0 text-uppercase text-muted small fw-semibold'
                    style={{letterSpacing: '0.05em'}}
                    aria-expanded={isOpen}
                  >
                    {section.group}
                    <FaChevronDown
                      size={10}
                      style={{
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
                      }}
                    />
                  </button>
                  <Collapse in={isOpen}>
                    <div>
                      <ListGroup variant="flush">
                        {section.items.map((item, index) => (
                          <Accordion defaultActiveKey={undefined} flush key={index}>
                            <Accordion.Item eventKey="0">
                              <Accordion.Header>
                                <span className='d-flex align-items-center gap-2'>
                                  <span className='text-primary'>{item.icon}</span>
                                  {item.title}
                                  {item.title === 'Admin' && !companyProfileComplete && (
                                    <Badge bg='danger' pill title='Company profile is incomplete'>!</Badge>
                                  )}
                                </span>
                              </Accordion.Header>
                              <Accordion.Body className='p-1'>
                                {item.links?.map((link, linkIndex) => (
                                  <ListGroup.Item className="py-2 px-1 border-none" key={linkIndex}>
                                    <Link href={link.href} passHref
                                      onClick={() => {
                                        //console.log(link.name);
                                        toggle();
                                      }}
                                      style={{ cursor: 'pointer' }}>
                                      {link.name}
                                      {link.name === 'Manage Company' && !companyProfileComplete && (
                                        <Badge bg='danger' pill className='ms-2'>!</Badge>
                                      )}
                                    </Link>
                                  </ListGroup.Item>
                                ))}
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        ))}
                      </ListGroup>
                    </div>
                  </Collapse>
                </div>
              )
            })}
          </Offcanvas.Body>
        </Offcanvas>
      </aside>
      <Container fluid className="p-0" style={{ marginTop: '70px' }}>
        <Row className="g-0">
          <Col className="p-3">
            {children}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default DashboardLayout
