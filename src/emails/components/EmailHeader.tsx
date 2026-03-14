import { Img, Section } from '@react-email/components';
import { emailColors, BASE_URL } from '../email-config';

export function EmailHeader() {
  return (
    <Section style={{ backgroundColor: emailColors.bg, padding: '24px 32px 0' }}>
      <Img
        src={`${BASE_URL}/images/email-header.png`}
        width="100%"
        alt="Forge Audit"
        style={{ display: 'block', borderRadius: '8px 8px 0 0' }}
      />
    </Section>
  );
}
