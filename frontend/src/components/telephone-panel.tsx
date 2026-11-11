import { telephoneBackground, telephoneContacts } from "@/lib/telephone-directory";

export function TelephoneCard({ body }: { body: string }) {
  const contacts = telephoneContacts(body);
  return <div className="telephone-card" style={{ backgroundImage: `url(${telephoneBackground})` }}>
    <div className="telephone-heading"><p>Ciudad de Las Breñas</p><h3>Teléfonos útiles</h3></div>
    <dl className="telephone-contacts">{contacts.map((contact, index) => <div key={index}>
      <dt>{contact.name}</dt><dd>{contact.number}</dd>
    </div>)}</dl>
    {!contacts.length && <p className="telephone-empty">No hay contactos disponibles.</p>}
  </div>;
}

