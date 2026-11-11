import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  resourceKey: string;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, endpoint, resourceKey, emptyText, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setHasError(false);
    getJson<Record<string, unknown>>(endpoint)
      .then((response) => {
        const data = response[resourceKey];
        if (!Array.isArray(data)) throw new Error('Invalid API response');
        if (active) setItems(data as T[]);
      })
      .catch(() => {
        if (active) setHasError(true);
      });
    return () => { active = false; };
  }, [endpoint, resourceKey]);

  let content;
  if (hasError) content = <p role="alert">Unable to load {title.toLowerCase()}.</p>;
  else if (items === null) content = <p role="status">Loading {title.toLowerCase()}...</p>;
  else if (items.length === 0) content = <p role="status">{emptyText}</p>;
  else content = <ul className="list-unstyled mb-0">{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>;

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>{content}</div></section>;
}
