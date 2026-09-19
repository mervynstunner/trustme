export const states = ['Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']

export const ledgerAccountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense']

export const handleDateChange=(newDate, setterFunc)=>{
  
}

export const round2 = (num)=> Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23

// For list-table amount columns (payment method breakdowns, discounts, etc.) where
// a bare "0" just means "not used" and reads as clutter/noise across most rows.
export const formatAmount = (num) => (num ? round2(num).toFixed(2) : '')

export const createCalc = (state) => {
  const {
    vatEnabled,
    vatRate,
    discount,
    cash,
    bank,
    card,
    cashAmount,
    bankAmount,
    cardAmount,
    advanceAmount,
    items
  } = state;

  return {
    // Calculate the gross total of all items (VAT included in prices)
    itemsGrossTotal: () => {
      return items.reduce((total, item) => {
        // Use the item's total (unitCost + vat) instead of salePrice * qty
        return round2(total + (item.total || 0)); 
      }, 0);
    },

    // Calculate discount amount (applied to gross total)
    discountAmount: function () {
      const grossTotal = this.itemsGrossTotal();
      if (typeof discount === 'number' && discount < 1) {
        // Percentage discount
        return round2(grossTotal * discount);
      } else {
        // Fixed amount discount
        return round2(Math.min(grossTotal, discount || 0));
      }
    },

    // Calculate total after discount (gross amount - discount)
    totalAfterDiscount: function () {
      return round2(this.itemsGrossTotal() - this.discountAmount());
    },

    // Extract the VAT component from the discounted total
    vatAmount: function () {
      if (!vatEnabled) return 0;

      const discountedTotal = this.totalAfterDiscount();
      // VAT component = total - (total / (1 + vatRate))
      return round2(discountedTotal - (discountedTotal / (1 + vatRate)));
    },

    // Calculate total without VAT
    totalWithoutVat: function () {
      if (vatEnabled) {
        // If VAT is enabled, extract VAT from the discounted total
        return round2(this.totalAfterDiscount() - this.vatAmount());
      } else {
        // If VAT is disabled, the discounted total is already without VAT
        return round2(this.totalAfterDiscount());
      }
    },

    // Return advance payment amount
    advanceAmount: () => {
      return round2(advanceAmount);
    },

    // Return cash payment amount
    cashAmount: () => {
      return round2(cash ? cashAmount : 0);
    },

    // Return bank transfer payment amount
    bankAmount: () => {
      return bank ? round2(bankAmount) : 0;
    },

    // Return card payment amount
    cardAmount: () => {
      return round2(card ? cardAmount : 0);
    },

    // Calculate total paid amount (cash + bank + card + advance)
    paidAmount: function () {
      return round2(
        this.cashAmount() + 
        this.bankAmount() + 
        this.cardAmount() + 
        this.advanceAmount()
      )
      ;
    },

    // Calculate grand total (equals totalAfterDiscount since we apply discount to gross)
    grandTotal: function () {
      return round2(this.totalAfterDiscount());
    },

    // Calculate pending (remaining) amount
    pendingAmount: function () {
      return (this.grandTotal() - this.paidAmount());
    }
  };
};



