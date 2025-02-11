"use client"

import React from "react";
import Header from "../../components/Header";


function Layout({ children }: never) {


  return (
    <div id="page-wrapper">
      <Header />
      <main className="!px-0">{children}</main>
    </div>
  );
}

export default Layout;
