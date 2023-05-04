import React from 'react';
import Container from './Container';

export function dataflowProvider(container: React.ReactNode, clientProps: any) {    
  return (
    <Container>{container}</Container>
  );
}