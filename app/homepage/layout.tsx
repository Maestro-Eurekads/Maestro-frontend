"use client"

import React, { useState } from "react";
import Header from "../../components/Header";
import TableModel from "./TableModel";


function Layout({ children }: never) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="page-wrapper">
<Header setIsOpen={setIsOpen} setIsView={undefined} />
      <main className="!px-0">{children}</main>
      <TableModel isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}

export default Layout;
