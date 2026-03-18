"use client";

import { ApolloProvider } from "@apollo/client/react";
import client from "../lib/apolloClient";
import "./globals.css";
import { ThemeProvider } from "@/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider client={client}>
          <ThemeProvider>
             {children}
          </ThemeProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}