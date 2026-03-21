import {
  Html, Head, Preview, Body, Container, Section,
  Heading, Text, Button, Hr, Row, Column,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface Props {
  recipientName: string;
  form: string;
  title: string;
  date: string;
  dateOnline: string;
  description: string;
  color: string;
}

export function TaxDeadlineEmail({
  recipientName,
  form,
  title,
  date,
  dateOnline,
  description,
  color,
}: Props) {
  const year = new Date().getFullYear() + 543;

  return (
    <Html lang="th">
      <Head />
      <Preview>📢 แจ้งเตือน: {title} — C-Advisor</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: '#f3f4f6', margin: 0, padding: 0, fontFamily: 'Arial, sans-serif' }}>
          <Container style={{ maxWidth: '600px', margin: '32px auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

            {/* Header */}
            <Section style={{ backgroundColor: color, padding: '36px 40px', textAlign: 'center' }}>
              <Text style={{ fontSize: '36px', margin: '0 0 8px' }}>📢</Text>
              <Heading style={{ margin: 0, color: '#ffffff', fontSize: '22px', fontWeight: '700' }}>
                แจ้งเตือนกำหนดการภาษี
              </Heading>
              <Text style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                C-Advisor · ปีภาษี {year}
              </Text>
            </Section>

            {/* Body */}
            <Section style={{ padding: '36px 40px' }}>
              <Text style={{ fontSize: '16px', color: '#374151', margin: '0 0 24px' }}>
                เรียน คุณ{recipientName},
              </Text>

              {/* Deadline box */}
              <Section style={{ backgroundColor: '#fef9c3', border: '2px solid #fbbf24', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '28px' }}>
                <Text style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: '#92400e', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {form}
                </Text>
                <Text style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {title}
                </Text>
                <Text style={{ margin: 0, fontSize: '15px', color: '#d97706' }}>
                  📅 กำหนดส่ง: <strong>{date}</strong>
                </Text>
                <Text style={{ margin: '4px 0 0', fontSize: '13px', color: '#b45309' }}>
                  {dateOnline}
                </Text>
              </Section>

              {/* Description */}
              <Text style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.7', margin: '0 0 24px' }}>
                {description}
              </Text>

              {/* Checklist */}
              <Section style={{ backgroundColor: '#f0fdf4', borderLeft: `4px solid ${color}`, borderRadius: '0 10px 10px 0', padding: '20px 24px', marginBottom: '28px' }}>
                <Text style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                  📋 สิ่งที่ต้องเตรียม
                </Text>
                {[
                  'เอกสารรายได้ทุกประเภทในปีภาษีที่ผ่านมา',
                  'ใบเสร็จค่าใช้จ่ายที่สามารถหักลดหย่อนได้',
                  'เอกสารกองทุน RMF / SSF / LTF (ถ้ามี)',
                  'ใบเสร็จเบี้ยประกันสังคม / ประกันชีวิต',
                  'บัตรประชาชนและหมายเลขบัตรประจำตัวผู้เสียภาษี',
                ].map((item, i) => (
                  <Text key={i} style={{ margin: '4px 0', fontSize: '14px', color: '#374151' }}>
                    ✓ {item}
                  </Text>
                ))}
              </Section>

              {/* CTA */}
              <Section style={{ textAlign: 'center' }}>
                <Button
                  href="https://c-advisor.vercel.app/tax-calculator"
                  style={{
                    backgroundColor: color,
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '15px',
                    padding: '14px 32px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                  }}
                >
                  🚀 คำนวณภาษีของคุณฟรี
                </Button>
              </Section>
            </Section>

            <Hr style={{ borderColor: '#e5e7eb', margin: 0 }} />

            {/* Footer */}
            <Section style={{ backgroundColor: '#f9fafb', padding: '20px 40px', textAlign: 'center' }}>
              <Text style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                C-Advisor · ที่ปรึกษาด้านภาษีประเทศไทย
              </Text>
              <Text style={{ margin: '4px 0 0', fontSize: '11px', color: '#c4c4c4' }}>
                หากคุณไม่ต้องการรับอีเมลนี้ กรุณาติดต่อเรา
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
