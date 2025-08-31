// src/components/AuthLayout.tsx
import * as React from 'react';
import { Card, CardContent, Container, Grid, Typography } from '@mui/material';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <Container maxWidth="md">
      <Grid container spacing={3} alignItems="center" sx={{ minHeight: '70vh' }}>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              background: 'linear-gradient(90deg,#6C5CE7,#00C4B3)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ mt: 1, color: 'text.secondary' }}>{subtitle}</Typography>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>{children}</CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
