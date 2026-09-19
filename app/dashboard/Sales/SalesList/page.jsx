"use client";

import { round2, formatAmount } from "../../utils";
import {
  Container,
  Col,
  Row,
  Form,
  ButtonGroup,
  Button,
  Table,
  Stack,
  Badge,
} from "react-bootstrap";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios, { get } from "axios";
import { toast } from "react-toastify";
import DocumentPreview from "@/app/components/DocumentPreview";

const STATUS_VARIANTS = {
  paid: "success",
  confirmed: "info",
  partially_paid: "warning",
  pending: "secondary",
  draft: "dark",
  Cancelled: "danger",
};


export default function SaleListPage() {
  const [sales, setSales] = useState([]);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const getSales = useCallback(
    async (query) => {
      const { data } = await axios.get(
        `/api/sales?startDate=${date.startDate}&endDate=${date.endDate}&limit=${limit}&searchQuery=${query}`
      );
      setSales(data);
    },
    [date.startDate, date.endDate, limit]
  );

  const handlePrintSale = async (invoiceNo, controlId, customerId) => {
    if (window.confirm(`Print Invoice ${invoiceNo}`)) {
      toast.promise(
        axios
          .post(
            `/api/print/invoice/${invoiceNo}/${controlId}/${customerId}`,
            {},
            { responseType: "blob" }
          )
          .then((response) => {
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
          }),
        {
          pending: "...wait",
          success: "Success",
          error: "Failed to Print Invoice",
        }
      );
    }
  };

  const handlePreview = async (invoiceNo, controlId, customerId) => {
    try {
      const { data } = await axios.get(
        `/api/sales/${invoiceNo}/${controlId}/${customerId}`
      );
      setSelectedSale(data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching sale preview:", error);
      toast.error("Failed to load invoice preview");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Handle search with debouncing
  useEffect(() => {
    if (!searchQuery) {
      getSales(""); // Immediate call for empty search
      return;
    }

    const timeoutId = setTimeout(() => {
      getSales(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, getSales]);

  // Handle filter changes (immediate call)
  useEffect(() => {
    getSales(searchQuery);
  }, [date.startDate, date.endDate, limit, getSales, searchQuery]);

  const cancelInvoice = async (invoiceNo, controlId, customerId, status) => {
    const newStatus = status === "Cancelled" ? "pending" : "Cancelled";
    if (window.confirm(`Change invoice ${invoiceNo} status?`)) {
      const { data } = await axios.patch(
        `/api/sales/status/${invoiceNo}/${controlId}/${customerId}`,
        { status: newStatus }
      );
      setSales((prev) =>
        prev.map((sale) => (sale._id === data._id ? data : sale))
      );
    }
  };

  return (
    <Container fluid>
      <h1>Invoice/Sales List</h1>
      <Row className="bg-light border py-1">
        <Col className="col-md-2">
          <Form.Group>
            <Form.Select value={limit} onChange={(e) => setLimit(e.target.value)}>
              <option value=''>--entries-- (all)</option>
              {[5, 10, 100, 150, 200, 250, 500].map((x, index) => (
                <option key={index} value={x}>
                  {x}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col className="col-md-2">
          <Form.Control
            type="date"
            value={date.startDate}
            onChange={(e) =>
              setDate((prevDate) => ({
                ...prevDate,
                startDate: e.target.value,
              }))
            }
          />
        </Col>
        <Col className="col-md-2">
          <Form.Control
            type="date"
            value={date.endDate}
            onChange={(e) =>
              setDate((prevDate) => ({
                ...prevDate,
                endDate: e.target.value,
              }))
            }
          />
        </Col>
        <Col className="col-md-3">
          <Form.Control
            type="text"
            placeholder="customer, invoiceNo, controlNo, PoNo"
            aria-describedby="addon1"
            value={searchQuery}
            onChange={handleSearch}
          />
        </Col>
        <Col className="col-xs-12">
          <ButtonGroup>
            <Button size="md" variant="outline-danger">
              RESET
            </Button>
            <Button size="md" variant="outline-warning">
              SEARCH
            </Button>
            <Button size="md" variant="outline-success">
              EXCEL
            </Button>
            <Button size="md">PRINT</Button>
          </ButtonGroup>
        </Col>
        <Col>
          <Button
            variant="danger"
            onClick={(e) => {
              if (
                window.confirm("Are you sure you want to add a new invoice?")
              ) {
                window.location.href = "/dashboard/Sales";
              }
            }}
          >
            create+
          </Button>
        </Col>
      </Row>

      <Table striped="columns" bordered hover responsive className="m-2 align-middle">
        <thead>
          <tr>
            <th>#</th>
            <th>Invoice</th>
            <th>Date</th>
            <th>Customer</th>
            <th className="text-end">Total</th>
            <th className="text-end">Pending</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales &&
            sales?.map((sale, index) => (
              <tr
                key={sale.controlId}
                className={
                  sale.status === "Cancelled" ? "table-danger" : undefined
                }
              >
                <td>{index +1}</td>
                <td>
                  <Badge pill>{sale.invoiceNo}</Badge>
                  <div className="text-muted small">{sale.controlId}</div>
                </td>
                <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                <td>{sale?.customerName}</td>
                <td className="text-end">{round2(sale?.totalAfterDiscount || 0).toFixed(2)}</td>
                <td className="text-end">{formatAmount(sale?.pendingAmount)}</td>
                <td>
                  <Badge bg={STATUS_VARIANTS[sale?.status] || "secondary"}>{sale?.status}</Badge>
                </td>
                <td>
                  <Stack gap={2} direction="horizontal">
                    <Button
                      onClick={() =>
                        handlePreview(
                          sale.invoiceNo,
                          sale.controlId,
                          sale.customerId
                        )
                      }
                      variant="outline-info btn-sm"
                      title="Preview"
                    >
                      👆
                    </Button>
                    <Button
                      variant="outline-success btn-sm"
                      onClick={() =>
                        handlePrintSale(
                          sale.invoiceNo,
                          sale.controlId,
                          sale.customerId
                        )
                      }
                      title="Print"
                    >
                      🖨
                    </Button>
                    <Button
                      variant="outline-danger btn-sm"
                      onClick={() =>
                        cancelInvoice(
                          sale.invoiceNo,
                          sale.controlId,
                          sale.customerId,
                          sale.status
                        )
                      }
                      title={sale.status === "Cancelled" ? "Restore" : "Cancel"}
                    >
                      ❌
                    </Button>
                  </Stack>
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={4}>Totals</th>
            <td className="text-end">
              {round2(
                sales.reduce((acc, sale) => acc + (sale.totalAfterDiscount || 0), 0)
              ).toFixed(2)}
            </td>
            <td className="text-end">
              {round2(sales.reduce((acc, sale) => acc + (sale.pendingAmount || 0), 0)).toFixed(2)}
            </td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </Table>
      <DocumentPreview
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Invoice Preview"
        documentLabel="TAX INVOICE"
        company={selectedSale.company}
        party={{
          label: "BILL TO",
          name: selectedSale.customer?.name,
          address: selectedSale.customer?.address,
          phone: selectedSale.customer?.phone,
          trn: selectedSale.customer?.trn,
        }}
        documentNoLabel="Invoice"
        documentNo={selectedSale.sale?.invoiceNo}
        date={selectedSale.sale?.date || selectedSale.sale?.createdAt}
        details={[
          { label: "Control No", value: selectedSale.sale?.controlId },
          { label: "Due Date", value: "45days" },
          { label: "Delivery Note", value: selectedSale.sale?.deliveryNote },
          { label: "PO No", value: selectedSale.sale?.purchaseOrderNumber },
        ]}
        priceLabel="Price"
        items={selectedSale.transaction?.items?.map((item) => ({
          ...item,
          price: item.salePrice,
        }))}
        totals={[
          { label: "Subtotal", value: selectedSale.sale?.totalWithoutVat },
          { label: "Discount", value: selectedSale.sale?.discountAmount },
          { label: `Tax (${selectedSale.sale?.vatRate}%)`, value: selectedSale.sale?.vatAmount },
          { label: "Total", value: selectedSale.sale?.totalAfterDiscount, emphasize: true },
          { label: "Amount Paid", value: selectedSale.sale?.paidAmount },
          { label: "Balance Due", value: selectedSale.sale?.pendingAmount },
        ]}
        amountInWords={selectedSale.sale?.amountInWords}
        terms={[
          "Payment due in 45 days upon receipt",
          "Please reference invoice number when paying",
        ]}
        forLabel={`FOR ${selectedSale.company?.name || ""}`}
        footnote="This is a system-generated Invoice, present control number [controlNo] for any resolutions"
      />
    </Container>
  );
}
