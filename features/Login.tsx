"use client";

import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { signIn } from "next-auth/react"


function Login() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios
        .post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/local`, {
          identifier: email,
          password: pwd,
        })
        .then(async () => {
          await signIn("credentials", {
            email: email,
            password: pwd,
            callbackUrl: "/",
          });
        });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-[500px] border shadow-xl rounded-[10px] p-[24px]">
        <h3 className="text-center text-[30px] font-medium">Welcome back!</h3>
        <p className="text-center">
          Log back in to have access to your media plans
        </p>
        <form onSubmit={handleSubmit} className="mt-[20px] space-y-[16px]">
          <div>
            <label htmlFor="">Email Address</label>
            <input
              type="email"
              className="p-[10px] rounded-[8px] border w-full outline-none"
              placeholder="example@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="">Password</label>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                className="p-[10px] rounded-[8px] border w-full outline-none"
                placeholder="**********"
                required
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
              <div
                className="absolute right-2 top-4 cursor-pointer"
                onClick={() => setVisible(!visible)}>
                {!visible ? <Eye size={17} /> : <EyeOff size={17} />}
              </div>
            </div>
          </div>
          <button
            className="rounded-[8px] w-full p-[10px] h-[40px] bg-[#3175FF] text-white text-[16px] font-semibold flex justify-center items-center"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
