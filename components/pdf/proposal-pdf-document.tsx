import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { Proposal } from "@/types/database";

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
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 10,
    marginTop: 6,
  },
  priceLabel: { fontSize: 11, fontWeight: 700 },
  priceValue: { fontSize: 16, fontWeight: 700 },
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
  return (
    <Document title={`Propuesta — ${proposal.title}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Propuesta comercial · BriefFast</Text>
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
          {proposal.scope_items.map((item, i) => (
            <View key={i} style={styles.scopeItem}>
              <Text style={styles.scopeLabel}>• {item.label}</Text>
              {item.description && (
                <Text style={styles.scopeDescription}>{item.description}</Text>
              )}
            </View>
          ))}

          {proposal.price != null && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Precio total</Text>
              <Text style={styles.priceValue}>
                {proposal.currency} {proposal.price.toLocaleString()}
              </Text>
            </View>
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

        <Text style={styles.footer}>Generado con BriefFast · brieffast.app</Text>
      </Page>
    </Document>
  );
}
