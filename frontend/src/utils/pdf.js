import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportExpensesPDF(rows, title = 'My Expenses') {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 16)

  const head = [['ID', 'Amount', 'Description', 'Payment', 'Category', 'Created']]
  const body = rows.map(e => [
    e.id,
    e.amount,
    e.expenseDescription,
    e.paymentMethod,
    e.categoryId,
    (e.expenseCreate || '').toString().replace('T', ' ').slice(0, 19)
  ])

  autoTable(doc, {
    startY: 22,
    head,
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [25, 118, 210] },
  })

  const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
  doc.save(`${title.replace(/\s+/g, '-')}-${ts}.pdf`)
}

export function exportUsersPDF(rows, title = 'Users') {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 16)

  const head = [['Name', 'Email', 'Mobile', 'Created', 'Id?']]
  const body = rows.map(u => [
    u.name || '',
    u.email || '',
    u.mobile_number || '',
    (u.accountCreateDate || '').toString().replace('T',' ').slice(0,19),
    (u.id ?? u.Id) ?? ''
  ])

  autoTable(doc, {
    startY: 22,
    head,
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [25, 118, 210] },
  })

  const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
  doc.save(`${title.replace(/\s+/g, '-')}-${ts}.pdf`)
}
