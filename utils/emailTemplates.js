/**
 * Base email layout (simple & clean)
 */
const baseTemplate = (title, content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #1f2937;">${title}</h2>
    <div style="font-size: 14px; color: #374151;">
      ${content}
    </div>
    <hr style="margin: 24px 0;" />
    <p style="font-size: 12px; color: #6b7280;">
      MedInventory System<br/>
      This is an automated email. Please do not reply.
    </p>
  </div>
`;

/**
 * Password reset email
 */
const passwordResetTemplate = (resetLink) =>
  baseTemplate(
    "Reset your password",
    `
      <p>You requested to reset your password.</p>
      <p>
        Click the link below to set a new password:
      </p>
      <p>
        <a href="${resetLink}" style="color: #2563eb;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in <strong>15 minutes</strong>.</p>
    `
  );

/**
 * Inventory alert email
 */
const inventoryAlertTemplate = ({ expiringBatches, lowStockMedicines }) =>
  baseTemplate(
    "Inventory Alerts",
    `
      <p><strong>Expiring Soon:</strong> ${expiringBatches.length}</p>
      <p><strong>Low Stock:</strong> ${lowStockMedicines.length}</p>

      ${
        expiringBatches.length
          ? `
        <h4>Expiring Batches</h4>
        <ul>
          ${expiringBatches
            .map(
              (b) =>
                `<li>${b.medicineName} (Batch ${b.batchNumber}) - expires on ${new Date(
                  b.expiryDate
                ).toDateString()}</li>`
            )
            .join("")}
        </ul>
      `
          : ""
      }

      ${
        lowStockMedicines.length
          ? `
        <h4>Low Stock Medicines</h4>
        <ul>
          ${lowStockMedicines
            .map(
              (m) =>
                `<li>${m.name} - ${m.totalQty} remaining (min ${m.minStock})</li>`
            )
            .join("")}
        </ul>
      `
          : ""
      }
    `
  );

module.exports = {
  passwordResetTemplate,
  inventoryAlertTemplate,
};
