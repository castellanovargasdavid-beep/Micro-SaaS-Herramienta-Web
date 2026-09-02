import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { APP_NAME } from "@/lib/constants";
import { computeItemSubtotal } from "@/lib/proposal-budget";
import type { Proposal } from "@/types/database";

const PRICING_TYPE_LABELS: Record<string, string> = {
  fixed: "Fijo",
  hourly: "Por hora",
  monthly: "Por mes",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a" },
  eyebrow: {
    fontSize: 9,
    color: "#6d28d9",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 10, color: "#555", marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#111" },
  scopeItem: { marginBottom: 8 },
  scopeLabel: { fontSize: 11, fontWeight: 700 },
  scopeDescription: { fontSize: 10, color: "#444", marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  colLabel: { flex: 3, fontSize: 10 },
  colQty: { flex: 1, fontSize: 10, textAlign: "right" },
  colUnit: { flex: 1.2, fontSize: 10, textAlign: "right" },
  colSubtotal: { flex: 1.2, fontSize: 10, textAlign: "right", fontWeight: 700 },
  headerText: { fontSize: 9, color: "#888", textTransform: "uppercase" },
  totalsBox: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: "50%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalsLabel: { fontSize: 10, color: "#555" },
  totalsValue: { fontSize: 10 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: { fontSize: 12, fontWeight: 700 },
  grandTotalValue: { fontSize: 16, fontWeight: 700 },
  signatureBox: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 16,
  },
  signatureImage: { width: 180, height: 65, objectFit: "contain" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});

export function ProposalPdfDocument({ proposal }: { proposal: Proposal }) {
  const hasPricedItems = proposal.scope_items.some((item) => item.unitPrice != null);

  return (
    <Document title={`Propuesta — ${proposal.title}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Propuesta comercial · {APP_NAME}</Text>
        <Text style={styles.title}>{proposal.title}</Text>
        {proposal.client_name && (
          <Text style={styles.meta}>Para: {proposal.client_name}</Text>
        )}

        {proposal.intro_message && (
          <View style={styles.section}>
            <Text>{proposal.intro_message}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alcance del proyecto</Text>

          {hasPricedItems ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.colLabel, styles.headerText]}>Entregable</Text>
                <Text style={[styles.colQty, styles.headerText]}>Cant.</Text>
                <Text style={[styles.colUnit, styles.headerText]}>Precio unit.</Text>
                <Text style={[styles.colSubtotal, styles.headerText]}>Subtotal</Text>
              </View>
              {proposal.scope_items.map((item, i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={styles.colLabel}>
                    <Text style={styles.scopeLabel}>{item.label}</Text>
                    {item.description && (
                      <Text style={styles.scopeDescription}>{item.description}</Text>
                    )}
                    {item.pricingType && (
                      <Text style={{ fontSize: 8, color: "#999", marginTop: 1 }}>
                        {PRICING_TYPE_LABELS[item.pricingType]}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.colQty}>{item.quantity ?? 1}</Text>
                  <Text style={styles.colUnit}>
                    {item.unitPrice != null ? item.unitPrice.toLocaleString() : "—"}
                  </Text>
                  <Text style={styles.colSubtotal}>
                    {item.unitPrice != null
                      ? computeItemSubtotal(item).toLocaleString()
                      : "—"}
                  </Text>
                </View>
              ))}

              <View style={styles.totalsBox}>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Subtotal</Text>
                  <Text style={styles.totalsValue}>
                    {proposal.currency} {(proposal.subtotal ?? 0).toLocaleString()}
                  </Text>
                </View>
                {proposal.discount_amount > 0 && (
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>Descuento</Text>
                    <Text style={styles.totalsValue}>
                      -{proposal.currency} {proposal.discount_amount.toLocaleString()}
                    </Text>
                  </View>
                )}
                {proposal.tax_percentage > 0 && (
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>
                      Impuesto ({proposal.tax_percentage}%)
                    </Text>
                    <Text style={styles.totalsValue}>
                      {proposal.currency}{" "}
                      {(
                        ((proposal.subtotal ?? 0) - proposal.discount_amount) *
                        (proposal.tax_percentage / 100)
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>Total</Text>
                  <Text style={styles.grandTotalValue}>
                    {proposal.currency} {(proposal.price ?? 0).toLocaleString()}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {proposal.scope_items.map((item, i) => (
                <View key={i} style={styles.scopeItem}>
                  <Text style={styles.scopeLabel}>• {item.label}</Text>
                  {item.description && (
                    <Text style={styles.scopeDescription}>{item.description}</Text>
                  )}
                </View>
              ))}
              {proposal.price != null && (
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>Precio total</Text>
                  <Text style={styles.grandTotalValue}>
                    {proposal.currency} {proposal.price.toLocaleString()}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {proposal.valid_until && (
          <Text style={styles.meta}>
            Válida hasta{" "}
            {new Date(proposal.valid_until).toLocaleDateString("es", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        )}

        {proposal.status === "accepted" && proposal.signature_data && (
          <View style={styles.signatureBox}>
            <Text style={styles.sectionTitle}>Firma de aceptación</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is not an HTML <img>; it has no alt prop. */}
            <Image src={proposal.signature_data} style={styles.signatureImage} />
            <Text style={{ fontSize: 10, marginTop: 4 }}>{proposal.signer_name}</Text>
            <Text style={{ fontSize: 9, color: "#666" }}>
              Firmado el{" "}
              {proposal.signed_at &&
                new Date(proposal.signed_at).toLocaleDateString("es", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              {proposal.signer_ip ? ` · IP ${proposal.signer_ip}` : ""}
            </Text>
          </View>
        )}

        <Text style={styles.footer}>Generado con {APP_NAME} · briefquick.com</Text>
      </Page>
    </Document>
  );
}
