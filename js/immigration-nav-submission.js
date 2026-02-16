/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: immigration-nav-submission.js
 * Declaration ID: IP-77EB3BE2-MLL28ZV4
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Immigration Navigator Submission Automation
 * Handles email submissions, lead creation, and consultation scheduling
 * 
 * @author Barbrick Design
 * @date 2026-02-12
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Try backend service first, fallback to simulated mode
    EMAIL_API_URL: window.location.hostname === 'localhost' 
      ? 'http://localhost:4000' 
      : 'https://barbrickdesign.github.io/api',
    BACKEND_AVAILABLE: false, // Will be checked on init
    CONTACT_EMAIL: 'BarbrickDesign@gmail.com'
  };

  // State management
  const state = {
    userEmail: null,
    reportGenerated: false,
    lastReport: null
  };

  /**
   * Check if backend email service is available
   */
  async function checkBackendAvailability() {
    try {
      const response = await fetch(`${CONFIG.EMAIL_API_URL}/health`, {
        method: 'GET',
        timeout: 3000
      });
      CONFIG.BACKEND_AVAILABLE = response.ok;
      console.log('📧 Email service:', CONFIG.BACKEND_AVAILABLE ? 'Available' : 'Unavailable');
    } catch (error) {
      CONFIG.BACKEND_AVAILABLE = false;
      console.log('📧 Email service: Unavailable (using fallback mode)');
    }
  }

  /**
   * Show notification to user
   */
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
      font-size: 14px;
      line-height: 1.5;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Show modal dialog
   */
  function showModal(title, content, buttons = []) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'submission-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
      `;
      
      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.98));
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.9);
        color: #e5e7eb;
      `;
      
      const modalTitle = document.createElement('h3');
      modalTitle.style.cssText = `
        margin: 0 0 20px 0;
        font-size: 1.5rem;
        color: #38bdf8;
      `;
      modalTitle.textContent = title;
      
      const modalBody = document.createElement('div');
      modalBody.style.cssText = 'margin-bottom: 24px; line-height: 1.6;';
      modalBody.innerHTML = content;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      `;
      
      buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.style.cssText = `
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          ${btn.primary ? 
            'background: #38bdf8; color: #000;' : 
            'background: transparent; border: 1px solid rgba(148, 163, 184, 0.3); color: #e5e7eb;'
          }
        `;
        button.onmouseover = () => {
          button.style.opacity = '0.8';
          button.style.transform = 'translateY(-2px)';
        };
        button.onmouseout = () => {
          button.style.opacity = '1';
          button.style.transform = 'translateY(0)';
        };
        button.onclick = () => {
          document.body.removeChild(modal);
          resolve(btn.value);
        };
        buttonContainer.appendChild(button);
      });
      
      modalContent.appendChild(modalTitle);
      modalContent.appendChild(modalBody);
      modalContent.appendChild(buttonContainer);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      // Close on background click
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve(null);
        }
      };
    });
  }

  /**
   * Collect user email if not already collected
   */
  async function collectUserEmail() {
    if (state.userEmail) {
      return state.userEmail;
    }
    
    const content = `
      <p>Please enter your email address to receive the immigration case report:</p>
      <input 
        type="email" 
        id="userEmailInput" 
        placeholder="your@email.com"
        style="
          width: 100%;
          padding: 12px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.8);
          color: #e5e7eb;
          font-size: 14px;
          margin-top: 12px;
        "
        required
      />
      <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
        We'll use this email to send you the report and any follow-up information.
      </p>
    `;
    
    const result = await showModal('Email Required', content, [
      { text: 'Cancel', value: null, primary: false },
      { text: 'Continue', value: 'continue', primary: true }
    ]);
    
    if (result === 'continue') {
      const emailInput = document.getElementById('userEmailInput');
      const email = emailInput?.value?.trim();
      
      if (email && isValidEmail(email)) {
        state.userEmail = email;
        return email;
      } else {
        showNotification('Please enter a valid email address', 'error');
        return await collectUserEmail(); // Retry
      }
    }
    
    return null;
  }

  /**
   * Validate email format
   */
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Generate case report from form data
   */
  function generateCaseReport() {
    // Check if enterprise features are available
    if (window.immigrationEnterprise && typeof window.immigrationEnterprise.generateCaseReport === 'function') {
      return window.immigrationEnterprise.generateCaseReport();
    }
    
    // Fallback: collect form data manually
    const formData = {
      age: document.getElementById('age')?.value,
      countryOfBirth: document.getElementById('countryOfBirth')?.value,
      currentCountry: document.getElementById('currentCountry')?.value,
      currentStatus: document.getElementById('currentStatus')?.value,
      entryMethod: document.getElementById('entryMethod')?.value,
      educationLevel: document.getElementById('educationLevel')?.value,
      timestamp: new Date().toISOString()
    };
    
    let report = '='.repeat(70) + '\n';
    report += 'IMMIGRATION CASE REPORT\n';
    report += 'Generated by Immigration Navigator\n';
    report += '='.repeat(70) + '\n\n';
    
    report += 'PERSONAL INFORMATION\n';
    report += '-'.repeat(70) + '\n';
    report += `Age: ${formData.age || 'Not provided'}\n`;
    report += `Country of Birth: ${formData.countryOfBirth || 'Not provided'}\n`;
    report += `Current Country: ${formData.currentCountry || 'Not provided'}\n`;
    report += `Current Status: ${formData.currentStatus || 'Not provided'}\n`;
    report += `Entry Method: ${formData.entryMethod || 'Not provided'}\n`;
    report += `Education Level: ${formData.educationLevel || 'Not provided'}\n\n`;
    
    report += 'DISCLAIMER\n';
    report += '-'.repeat(70) + '\n';
    report += 'This report is for educational purposes only and does not constitute\n';
    report += 'legal advice. Please consult with a licensed immigration attorney for\n';
    report += 'specific guidance on your case.\n\n';
    
    report += 'NEXT STEPS\n';
    report += '-'.repeat(70) + '\n';
    report += '1. Review this report with an immigration attorney\n';
    report += '2. Gather required documents and evidence\n';
    report += '3. Complete necessary USCIS forms\n';
    report += '4. Submit application with appropriate fees\n\n';
    
    report += 'Generated: ' + new Date().toLocaleString() + '\n';
    report += 'For questions, contact: ' + CONFIG.CONTACT_EMAIL + '\n';
    
    return report;
  }

  /**
   * Send email via backend API
   */
  async function sendEmailViaAPI(to, subject, body) {
    try {
      const response = await fetch(`${CONFIG.EMAIL_API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject,
          html: `<pre style="font-family: monospace; white-space: pre-wrap;">${body}</pre>`,
          text: body,
          meta: {
            source: 'immigration-navigator',
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Email API error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create lead in system
   */
  async function createLead(email, name = 'Immigration Navigator User') {
    if (!CONFIG.BACKEND_AVAILABLE) {
      return { success: false, error: 'Backend unavailable' };
    }
    
    try {
      const response = await fetch(`${CONFIG.EMAIL_API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          source: 'immigration-navigator',
          status: 'new',
          meta: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Lead creation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Email case report to user
   */
  async function emailCaseReportToUser() {
    try {
      // Collect user email
      const email = await collectUserEmail();
      if (!email) {
        showNotification('Email submission cancelled', 'info');
        return;
      }
      
      // Generate report
      const report = generateCaseReport();
      state.lastReport = report;
      state.reportGenerated = true;
      
      // Try backend API first
      if (CONFIG.BACKEND_AVAILABLE) {
        showNotification('Sending email...', 'info');
        
        const result = await sendEmailViaAPI(
          email,
          'Your Immigration Case Report',
          report
        );
        
        if (result.success) {
          showNotification('✅ Report sent successfully to ' + email, 'success');
          
          // Create lead for follow-up
          await createLead(email);
          return;
        }
      }
      
      // Fallback: Use mailto link
      const subject = encodeURIComponent('Immigration Case Report');
      const body = encodeURIComponent(report);
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
      
      // Check if mailto body is too long (some email clients have limits)
      if (mailtoLink.length > 2000) {
        // Download instead
        showNotification('Report is ready. Downloading file...', 'info');
        downloadCaseReport();
        showNotification('Please email the downloaded file to yourself', 'info');
      } else {
        window.location.href = mailtoLink;
        showNotification('Opening email client...', 'success');
      }
      
    } catch (error) {
      console.error('Email error:', error);
      showNotification('Failed to send email. Please try downloading the report.', 'error');
    }
  }

  /**
   * Email case report to attorney
   */
  async function emailCaseReportToAttorney() {
    try {
      const content = `
        <p>Enter the attorney's email address to send your immigration case report:</p>
        <input 
          type="email" 
          id="attorneyEmailInput" 
          placeholder="attorney@lawfirm.com"
          style="
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(148, 163, 184, 0.3);
            border-radius: 6px;
            background: rgba(15, 23, 42, 0.8);
            color: #e5e7eb;
            font-size: 14px;
            margin-top: 12px;
          "
          required
        />
        <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
          Make sure you have permission to share this information with the attorney.
        </p>
      `;
      
      const result = await showModal('Send to Attorney', content, [
        { text: 'Cancel', value: null, primary: false },
        { text: 'Send Report', value: 'send', primary: true }
      ]);
      
      if (result !== 'send') {
        showNotification('Attorney email cancelled', 'info');
        return;
      }
      
      const attorneyEmailInput = document.getElementById('attorneyEmailInput');
      const attorneyEmail = attorneyEmailInput?.value?.trim();
      
      if (!attorneyEmail || !isValidEmail(attorneyEmail)) {
        showNotification('Please enter a valid attorney email address', 'error');
        return;
      }
      
      // Also collect user email if not already done
      const userEmail = await collectUserEmail();
      if (!userEmail) {
        showNotification('User email required to send report', 'error');
        return;
      }
      
      // Generate report
      const report = generateCaseReport();
      state.lastReport = report;
      state.reportGenerated = true;
      
      // Add user contact info to report
      const reportWithContact = report + '\n' + '='.repeat(70) + '\n';
      const contactInfo = `\nClient Contact Information:\nEmail: ${userEmail}\n`;
      const fullReport = reportWithContact + contactInfo;
      
      // Try backend API first
      if (CONFIG.BACKEND_AVAILABLE) {
        showNotification('Sending report to attorney...', 'info');
        
        const result = await sendEmailViaAPI(
          attorneyEmail,
          `Immigration Case Report - ${userEmail}`,
          fullReport
        );
        
        if (result.success) {
          showNotification('✅ Report sent successfully to ' + attorneyEmail, 'success');
          
          // Send confirmation to user
          await sendEmailViaAPI(
            userEmail,
            'Immigration Report Sent to Attorney',
            `Your immigration case report has been sent to ${attorneyEmail}.\n\nThey should contact you soon to discuss your case.\n\nIf you don't hear back within 2-3 business days, please follow up directly.`
          );
          
          return;
        }
      }
      
      // Fallback: Use mailto link
      const subject = encodeURIComponent(`Immigration Case Report - ${userEmail}`);
      const body = encodeURIComponent(fullReport);
      const mailtoLink = `mailto:${attorneyEmail}?subject=${subject}&body=${body}`;
      
      if (mailtoLink.length > 2000) {
        showNotification('Report is ready. Downloading file...', 'info');
        downloadCaseReport();
        showNotification(`Please email the downloaded file to ${attorneyEmail}`, 'info');
      } else {
        window.location.href = mailtoLink;
        showNotification('Opening email client...', 'success');
      }
      
    } catch (error) {
      console.error('Attorney email error:', error);
      showNotification('Failed to send email to attorney. Please try downloading the report.', 'error');
    }
  }

  /**
   * Download case report
   */
  function downloadCaseReport() {
    try {
      const report = state.lastReport || generateCaseReport();
      state.lastReport = report;
      state.reportGenerated = true;
      
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `immigration-case-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('📥 Report downloaded successfully', 'success');
      
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Failed to download report', 'error');
    }
  }

  /**
   * Schedule consultation
   */
  async function scheduleConsultation() {
    try {
      // Collect user email first
      const email = await collectUserEmail();
      if (!email) {
        showNotification('Email required to schedule consultation', 'info');
        return;
      }
      
      const content = `
        <p>Select your preferred consultation time:</p>
        <div style="margin: 16px 0;">
          <label style="display: block; margin-bottom: 8px; color: #9ca3af; font-size: 13px;">
            Preferred Date
          </label>
          <input 
            type="date" 
            id="consultDate" 
            min="${new Date().toISOString().split('T')[0]}"
            style="
              width: 100%;
              padding: 12px;
              border: 1px solid rgba(148, 163, 184, 0.3);
              border-radius: 6px;
              background: rgba(15, 23, 42, 0.8);
              color: #e5e7eb;
              font-size: 14px;
              margin-bottom: 12px;
            "
            required
          />
          
          <label style="display: block; margin-bottom: 8px; color: #9ca3af; font-size: 13px;">
            Preferred Time
          </label>
          <select 
            id="consultTime"
            style="
              width: 100%;
              padding: 12px;
              border: 1px solid rgba(148, 163, 184, 0.3);
              border-radius: 6px;
              background: rgba(15, 23, 42, 0.8);
              color: #e5e7eb;
              font-size: 14px;
              margin-bottom: 12px;
            "
          >
            <option value="morning">Morning (9am - 12pm)</option>
            <option value="afternoon">Afternoon (12pm - 5pm)</option>
            <option value="evening">Evening (5pm - 8pm)</option>
          </select>
          
          <label style="display: block; margin-bottom: 8px; color: #9ca3af; font-size: 13px;">
            Phone Number (optional)
          </label>
          <input 
            type="tel" 
            id="consultPhone" 
            placeholder="+1 (555) 123-4567"
            style="
              width: 100%;
              padding: 12px;
              border: 1px solid rgba(148, 163, 184, 0.3);
              border-radius: 6px;
              background: rgba(15, 23, 42, 0.8);
              color: #e5e7eb;
              font-size: 14px;
              margin-bottom: 12px;
            "
          />
          
          <label style="display: block; margin-bottom: 8px; color: #9ca3af; font-size: 13px;">
            Additional Notes
          </label>
          <textarea 
            id="consultNotes" 
            placeholder="Any specific questions or concerns..."
            rows="3"
            style="
              width: 100%;
              padding: 12px;
              border: 1px solid rgba(148, 163, 184, 0.3);
              border-radius: 6px;
              background: rgba(15, 23, 42, 0.8);
              color: #e5e7eb;
              font-size: 14px;
              resize: vertical;
            "
          ></textarea>
        </div>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
          A consultation request will be sent to ${CONFIG.CONTACT_EMAIL}. 
          You'll receive confirmation within 1-2 business days.
        </p>
      `;
      
      const result = await showModal('Schedule Consultation', content, [
        { text: 'Cancel', value: null, primary: false },
        { text: 'Request Consultation', value: 'schedule', primary: true }
      ]);
      
      if (result !== 'schedule') {
        showNotification('Consultation request cancelled', 'info');
        return;
      }
      
      // Collect form data
      const date = document.getElementById('consultDate')?.value;
      const time = document.getElementById('consultTime')?.value;
      const phone = document.getElementById('consultPhone')?.value || 'Not provided';
      const notes = document.getElementById('consultNotes')?.value || 'None';
      
      if (!date) {
        showNotification('Please select a consultation date', 'error');
        return;
      }
      
      // Format consultation request
      const consultationRequest = `
CONSULTATION REQUEST
${'='.repeat(70)}

Client Email: ${email}
Phone: ${phone}

Preferred Date: ${date}
Preferred Time: ${time}

Additional Notes:
${notes}

Generated: ${new Date().toLocaleString()}
${'='.repeat(70)}
      `.trim();
      
      // Try to send via backend API
      if (CONFIG.BACKEND_AVAILABLE) {
        showNotification('Submitting consultation request...', 'info');
        
        // Create lead
        await createLead(email, 'Immigration Consultation Request');
        
        // Send to team
        const result = await sendEmailViaAPI(
          CONFIG.CONTACT_EMAIL,
          `Consultation Request - ${email}`,
          consultationRequest
        );
        
        if (result.success) {
          // Send confirmation to user
          await sendEmailViaAPI(
            email,
            'Consultation Request Received',
            `Thank you for your consultation request.\n\nPreferred Date: ${date}\nPreferred Time: ${time}\n\nWe'll contact you within 1-2 business days to confirm your appointment.\n\nIf you have any questions, please contact ${CONFIG.CONTACT_EMAIL}`
          );
          
          showNotification('✅ Consultation request submitted successfully!', 'success');
          return;
        }
      }
      
      // Fallback: Use mailto
      const subject = encodeURIComponent(`Consultation Request - ${email}`);
      const body = encodeURIComponent(consultationRequest);
      window.location.href = `mailto:${CONFIG.CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      
      showNotification('Opening email client to send consultation request...', 'success');
      
    } catch (error) {
      console.error('Consultation scheduling error:', error);
      showNotification('Failed to schedule consultation. Please contact us directly.', 'error');
    }
  }

  /**
   * Initialize the submission automation system
   */
  async function init() {
    console.log('🚀 Immigration Navigator Submission Automation initialized');
    
    // Check backend availability
    await checkBackendAvailability();
    
    // Expose functions globally
    window.emailCaseReport = emailCaseReportToUser;
    window.emailToAttorney = emailCaseReportToAttorney;
    window.downloadCaseReport = downloadCaseReport;
    window.scheduleconsultation = scheduleConsultation;
    
    // Also update existing button handlers
    const emailBtn = document.querySelector('button[onclick="emailCaseReport()"]');
    if (emailBtn) {
      emailBtn.onclick = emailCaseReportToAttorney;
    }
    
    console.log('✅ Submission automation ready');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
