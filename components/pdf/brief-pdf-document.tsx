import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { AiSummary } from "@/types/database";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  eyebrow: {
    fontSize: 9,
    color: "#6d28d9",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },
  meta: {
    fontSize: 10,
    color: "#555",
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    color: "#111",
  },
  paragraph: {
    fontSize: 10.5,
    lineHeight: 1.5,
  },
  bullet: {
    fontSize: 10.5,
    lineHeight: 1.5,
    marginBottom: 2,
  },
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

export function BriefPdfDocument({
  briefTitle,
  clientName,
  summary,
}: {
  briefTitle: string;
  clientName: string | null;
  summary: AiSummary;
}) {
  return (
    <Document title={`Brief — ${briefTitle}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Brief ejecutivo · BriefFast</Text>
        <Text style={styles.title}>{briefTitle}</Text>
        {clientName && <Text style={styles.meta}>Cliente: {clientName}</Text>}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen ejecutivo</Text>
          <Text style={styles.paragraph}>{summary.executive_summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivo</Text>
          <Text style={styles.paragraph}>{summary.objective}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entregables</Text>
          {summary.deliverables.map((item, i) => (
            <Text key={i} style={styles.bullet}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tono / voz de marca</Text>
          <Text style={styles.paragraph}>{summary.tone}</Text>
        </View>

        {summary.target_audience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audiencia objetivo</Text>
            <Text style={styles.paragraph}>{summary.target_audience}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assets necesarios</Text>
          {summary.assets_needed.map((item, i) => (
            <Text key={i} style={styles.bullet}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deadline</Text>
          <Text style={styles.paragraph}>
            {summary.deadline ?? "No especificado"}
          </Text>
        </View>

        {summary.budget_notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas de presupuesto</Text>
            <Text style={styles.paragraph}>{summary.budget_notes}</Text>
          </View>
        )}

        {summary.key_risks && summary.key_risks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riesgos / puntos de atención</Text>
            {summary.key_risks.map((item, i) => (
              <Text key={i} style={styles.bullet}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.footer}>Generado con BriefFast · brieffast.app</Text>
      </Page>
    </Document>
  );
}
