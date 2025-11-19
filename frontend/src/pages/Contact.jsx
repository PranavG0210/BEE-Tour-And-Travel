import Navigation from '../components/Navigation';

export default function Contact() {
  return (
    <div>
      <Navigation />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 className="section-title">Contact Us</h1>
        
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            Get in Touch
          </h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
            Have questions or need help? We're here to assist you!
          </p>
          
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                📧 Email
              </h3>
              <p style={{ color: 'var(--color-text-light)' }}>
                support@travelhub.com
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                📞 Phone
              </h3>
              <p style={{ color: 'var(--color-text-light)' }}>
                +1 (555) 123-4567
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                📍 Address
              </h3>
              <p style={{ color: 'var(--color-text-light)' }}>
                123 Travel Street<br />
                City, State 12345<br />
                Country
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                ⏰ Business Hours
              </h3>
              <p style={{ color: 'var(--color-text-light)' }}>
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

