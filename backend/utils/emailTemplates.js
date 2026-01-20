/**
 * Utility helpers
 */
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const MAX_ITEMS = 20;

/**
 * Base email layout (simple & clean)
 */
const baseTemplate = (title, content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 16px;">
    <h2 style="color: #1f2937; margin-bottom: 12px;">${escapeHtml(
      title
    )}</h2>

    <div style="font-size: 14px; color: #374151; line-height: 1.6;">
      ${content}
    </div>

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />

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

      <p style="margin: 16px 0;">
        <a href="${resetLink}"
           style="
             background-color: #2563eb;
             color: #ffffff;
             padding: 10px 16px;
             border-radius: 6px;
             text-decoration: none;
             display: inline-block;
           ">
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
      <p><strong>Summary</strong></p>
      <ul>
        <li>Expiring soon: <strong>${expiringBatches.length}</strong></li>
        <li>Low stock: <strong>${lowStockMedicines.length}</strong></li>
      </ul>

      ${
        expiringBatches.length
          ? `
        <h4 style="margin-top: 20px;">Expiring Batches</h4>
        <ul>
          ${expiringBatches
            .slice(0, MAX_ITEMS)
            .map(
              (b) =>
                `<li>
                  ${escapeHtml(b.medicineName)}
                  (Batch ${escapeHtml(b.batchNumber)})
                  – expires on ${formatDate(b.expiryDate)}
                </li>`
            )
            .join("")}
        </ul>
        ${
          expiringBatches.length > MAX_ITEMS
            ? `<p>Showing first ${MAX_ITEMS} items.</p>`
            : ""
        }
      `
          : ""
      }

      ${
        lowStockMedicines.length
          ? `
        <h4 style="margin-top: 20px;">Low Stock Medicines</h4>
        <ul>
          ${lowStockMedicines
            .slice(0, MAX_ITEMS)
            .map(
              (m) =>
                `<li>
                  ${escapeHtml(m.name)} –
                  ${m.totalQty} remaining
                  (minimum ${m.minStock})
                </li>`
            )
            .join("")}
        </ul>
        ${
          lowStockMedicines.length > MAX_ITEMS
            ? `<p>Showing first ${MAX_ITEMS} items.</p>`
            : ""
        }
      `
          : ""
      }
    `
  );

module.exports = {
  passwordResetTemplate,
  inventoryAlertTemplate,
};
