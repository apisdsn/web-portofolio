'use client';

import { notFound, useParams } from 'next/navigation';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { findResource } from '@/lib/admin/resources';

export default function ResourcePage() {
  const params = useParams<{ resource: string }>();
  const resource = findResource(params.resource);
  if (!resource) return notFound();
  return <ResourceManager resource={resource} />;
}
