import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface LeadNotificationData {
  companyName: string
  companyEmail: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  truckLoad: string
  priceMin: number
  priceMax: number
  address?: string
  city?: string
  state?: string
  zipCode?: string
  photoUrls?: string[]
  items?: Array<{ type: string; quantity: number }>
  quoteUrl?: string
}

export async function sendLeadNotification(data: LeadNotificationData) {
  if (!resend) {
    console.warn('⚠️  Resend API key not configured, skipping email notification')
    return { success: false, error: 'No API key configured' }
  }

  try {
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563EB; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; }
    .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2563EB; }
    .info-label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; }
    .info-value { font-size: 16px; margin-top: 5px; }
    .price-box { background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .price { font-size: 32px; font-weight: bold; }
    .item-list { list-style: none; padding: 0; }
    .item-list li { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .cta-button { display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
    .photos img { width: 100%; height: 120px; object-fit: cover; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 New Lead from ${data.companyName} Widget</h1>
    </div>

    <div class="content">
      <div class="info-box">
        <div class="info-label">Customer Name</div>
        <div class="info-value">📞 ${data.customerName}</div>
        <div class="info-value" style="color: #2563EB; font-weight: bold;">${data.customerPhone}</div>
        ${data.customerEmail ? `<div class="info-value">✉️ ${data.customerEmail}</div>` : ''}
      </div>

      <div class="price-box">
        <div style="font-size: 14px; opacity: 0.9;">🚛 ${data.truckLoad.replace('_', ' ')} Load</div>
        <div class="price">$${data.priceMin} - $${data.priceMax}</div>
        <div style="font-size: 14px; opacity: 0.9;">Estimated Price Range</div>
      </div>

      ${data.address ? `
      <div class="info-box">
        <div class="info-label">📍 Pickup Location</div>
        <div class="info-value">${data.address}</div>
        ${data.city && data.state ? `<div class="info-value">${data.city}, ${data.state} ${data.zipCode || ''}</div>` : ''}
      </div>
      ` : ''}

      ${data.items && data.items.length > 0 ? `
      <div class="info-box">
        <div class="info-label">📦 Items Identified</div>
        <ul class="item-list">
          ${data.items.map(item => `<li><strong>${item.type}</strong> × ${item.quantity}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      ${data.photoUrls && data.photoUrls.length > 0 ? `
      <div class="info-box">
        <div class="info-label">📸 Photos</div>
        <div class="photos">
          ${data.photoUrls.slice(0, 6).map(url => `<img src="${url}" alt="Item photo" />`).join('')}
        </div>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #666;">⏰ Lead received at ${new Date().toLocaleString()}</p>
        <p style="color: #999; font-size: 12px;">Powered by your widget at ${data.companyName}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `

    const result = await resend.emails.send({
      from: 'Widget Leads <leads@yourdomain.com>', // Change this to your verified domain
      to: data.companyEmail,
      subject: `🎯 New Lead: ${data.customerName} - ${data.truckLoad} Load ($${data.priceMin}-$${data.priceMax})`,
      html: emailHtml,
    })

    console.log('✅ Lead notification sent:', result)
    return { success: true, emailId: result.id }
  } catch (error: any) {
    console.error('❌ Failed to send lead notification:', error)
    return { success: false, error: error.message }
  }
}
