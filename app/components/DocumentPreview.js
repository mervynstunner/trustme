import React from 'react'
import { Modal } from 'react-bootstrap'

const DEFAULT_LOGO = 'https://res.cloudinary.com/drovqqnv7/image/upload/v1741761113/WhatsApp_Image_2024-06-18_at_11.01.53_sjff5x.jpg'

/**
 * Generic print-style preview for any transactional document
 * (invoice, purchase order, quotation, delivery note, return, ...).
 *
 * Every caller maps its own API response into this shape rather than
 * this component knowing about sale/purchase/quotation field names.
 *
 * @param {boolean} show
 * @param {() => void} onHide
 * @param {string} title            Modal header, e.g. "Invoice Preview"
 * @param {string} documentLabel    Big heading, e.g. "TAX INVOICE" / "PURCHASE ORDER"
 * @param {{name, poBox, phone, email, address, region, trn, logo}} company
 * @param {{label, name, address, phone, trn}} party      e.g. { label: 'BILL TO', ... } or { label: 'SUPPLIER', ... }
 * @param {string} documentNoLabel  e.g. "Invoice #"
 * @param {string|number} documentNo
 * @param {string|number} date
 * @param {{label, value}[]} details   Right-hand "DETAILS" panel rows
 * @param {string} priceLabel       Column header for unit price, default "Price"
 * @param {{name, description, unit, qty, price, vat, total}[]} items
 * @param {{label, value, emphasize}[]} totals
 * @param {string} amountInWords
 * @param {string[]} terms
 * @param {string} forLabel         e.g. `FOR ${company.name}`
 * @param {string} signatureLabel
 * @param {string} footnote
 */
export default function DocumentPreview({
  show,
  onHide,
  title = 'Document Preview',
  documentLabel = 'DOCUMENT',
  company = {},
  party = {},
  documentNoLabel = 'No',
  documentNo,
  date,
  details = [],
  priceLabel = 'Price',
  items = [],
  totals = [],
  amountInWords,
  terms = [],
  forLabel,
  signatureLabel = 'AUTHORIZED SIGNATURE',
  footnote = 'This is a system-generated document.',
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <header className="header">
            <div className="company-info">
              <div className="company-name">{company?.name}</div>
              <div className="company-details">
                PO Box: {company?.poBox} |{' '}
                {company?.phone} | {company?.email}
                <br />
                {company?.address}, {company?.region} | TRN: {company?.trn}
              </div>
            </div>
            <div className="logo-container">
              <img
                className="logo"
                style={{ width: 100, height: 100 }}
                src={company?.logo || DEFAULT_LOGO}
                alt="Company Logo"
              />
            </div>
          </header>

          <div className="document-title">
            <h1>{documentLabel}</h1>
            <div className="trn">
              {documentNoLabel} #: {documentNo} | {date}
            </div>
          </div>

          <div className="info-section">
            <div className="client-info">
              <div className="section-title">{party?.label || 'PARTY'}</div>
              <div><strong>{party?.name}</strong></div>
              <div>{party?.address}</div>
              <div>{party?.phone}</div>
              <div>VAT No: {party?.trn}</div>
            </div>

            <div className="invoice-info">
              <div className="section-title">DETAILS</div>
              {details.map((detail, index) => (
                <div key={index}>
                  <strong>{detail.label}:</strong> {detail.value}
                </div>
              ))}
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th className="text-left" style={{ width: '40%' }}>Description</th>
                <th className="text-center">Unit</th>
                <th className="text-center">Qty</th>
                <th className="text-center">{priceLabel}</th>
                <th className="text-center">VAT</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="text-left">
                    {item.name}
                    {item.description && (
                      <div className="item-description">{item.description}</div>
                    )}
                  </td>
                  <td className="text-center">{item.unit}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-center">{item.price}</td>
                  <td className="text-center">{item.vat}</td>
                  <td className="text-center">{item.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="totals-table">
              {totals.map((line, index) => (
                <tr key={index} className={line.emphasize ? 'fw-bold' : undefined}>
                  <td className="text-left">{line.label}</td>
                  <td className="text-right">{line.value}</td>
                </tr>
              ))}
            </tfoot>
          </table>

          {amountInWords && (
            <div className="amount-in-words">
              <strong>Amount in words:</strong> {amountInWords}
            </div>
          )}

          <footer className="footer">
            <div className="footer-title">TERMS</div>
            <div className="terms">
              <div>
                {terms.map((term, index) => (
                  <div key={index}>&bull; {term}</div>
                ))}
              </div>
              <div className="footer-verification footer-title">
                {forLabel || `FOR ${company?.name || ''}`}
              </div>
            </div>

            <div className="signature">
              <div className="footer-title">{signatureLabel}</div>
              <div className="signature-line"></div>
            </div>

            <small className="footnote">{footnote}</small>
          </footer>
        </div>
      </Modal.Body>
    </Modal>
  )
}
