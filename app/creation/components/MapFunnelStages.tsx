"use client";
import React, { useState, useEffect, useRef } from "react";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useCampaigns } from "../../utils/CampaignsContext";
import { useVerification } from "app/utils/VerificationContext";
import { useComments } from "app/utils/CommentProvider";
import { PlusIcon, Edit2, Trash2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Define type for funnel objects
interface Funnel {
  id: string;
  name: string;
  color: string;
}

// 100+ unique, visually distinct color classes (no duplicates, no close shades)
const colorPalette: string[] = [
  "bg-[#FF6633]", "bg-[#FFB399]", "bg-[#FF33FF]", "bg-[#FFFF99]", "bg-[#00B3E6]",
  "bg-[#E6B333]", "bg-[#3366E6]", "bg-[#999966]", "bg-[#99FF99]", "bg-[#B34D4D]",
  "bg-[#80B300]", "bg-[#809900]", "bg-[#E6B3B3]", "bg-[#6680B3]", "bg-[#66991A]",
  "bg-[#FF99E6]", "bg-[#CCFF1A]", "bg-[#FF1A66]", "bg-[#E6331A]", "bg-[#33FFCC]",
  "bg-[#66994D]", "bg-[#B366CC]", "bg-[#4D8000]", "bg-[#B33300]", "bg-[#CC80CC]",
  "bg-[#66664D]", "bg-[#991AFF]", "bg-[#E666FF]", "bg-[#4DB3FF]", "bg-[#1AB399]",
  "bg-[#E666B3]", "bg-[#33991A]", "bg-[#CC9999]", "bg-[#B3B31A]", "bg-[#00E680]",
  "bg-[#4D8066]", "bg-[#809980]", "bg-[#E6FF80]", "bg-[#1AFF33]", "bg-[#999933]",
  "bg-[#FF3380]", "bg-[#CCCC00]", "bg-[#66E64D]", "bg-[#4D80CC]", "bg-[#9900B3]",
  "bg-[#E64D66]", "bg-[#4DB380]", "bg-[#FF4D4D]", "bg-[#99E6E6]", "bg-[#6666FF]",
  "bg-[#FF6F61]", "bg-[#6B5B95]", "bg-[#88B04B]", "bg-[#F7CAC9]", "bg-[#92A8D1]",
  "bg-[#955251]", "bg-[#B565A7]", "bg-[#009B77]", "bg-[#DD4124]", "bg-[#D65076]",
  "bg-[#45B8AC]", "bg-[#EFC050]", "bg-[#5B5EA6]", "bg-[#9B2335]", "bg-[#DFCFBE]",
  "bg-[#55B4B0]", "bg-[#E15D44]", "bg-[#7FCDCD]", "bg-[#BC243C]", "bg-[#C3447A]",
  "bg-[#98B4D4]", "bg-[#77AADD]", "bg-[#FFB347]", "bg-[#B0B0B0]", "bg-[#B284BE]",
  "bg-[#C2B280]", "bg-[#6C3483]", "bg-[#2874A6]", "bg-[#229954]", "bg-[#F1C40F]",
  "bg-[#CA6F1E]", "bg-[#BA4A00]", "bg-[#7B241C]", "bg-[#1C2833]", "bg-[#117A65]",
  "bg-[#D4AC0D]", "bg-[#A569BD]", "bg-[#5499C7]", "bg-[#48C9B0]", "bg-[#F4D03F]",
  "bg-[#DC7633]", "bg-[#A04000]", "bg-[#922B21]", "bg-[#212F3C]", "bg-[#196F3D]",
  "bg-[#B9770E]", "bg-[#7D3C98]", "bg-[#2471A3]", "bg-[#17A589]", "bg-[#F7DC6F]",
  "bg-[#EB984E]", "bg-[#873600]", "bg-[#641E16]", "bg-[#17202A]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
  "bg-[#B7950B]", "bg-[#512E5F]", "bg-[#154360]", "bg-[#0E6251]", "bg-[#F9E79F]",
  "bg-[#EDBB99]", "bg-[#7E5109]", "bg-[#512E2E]", "bg-[#1B2631]", "bg-[#186A3B]",
  "bg-[#7D6608]", "bg-[#4A235A]", "bg-[#1B4F72]", "bg-[#117864]", "bg-[#FCF3CF]",
  "bg-[#FDEBD0]", "bg-[#784212]", "bg-[#4D5656]", "bg-[#212F3D]", "bg-[#145A32]",
];

// LocalStorage key for custom funnels, now scoped by plan id (cId)
const getLocalStorageFunnelsKey = (cId: string | undefined) =>
  cId ? `custom_funnels_v1_${cId}` : "custom_funnels_v1";

const MapFunnelStages = () => {
  const {
    campaignData,
    campaignFormData,
    cId,
    setCampaignFormData,
  } = useCampaigns();
  const { setIsDrawerOpen, setClose } = useComments();
  const { verifyStep, setHasChanges } = useVerification();
  const [previousValidationState, setPreviousValidationState] = useState<boolean | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customFunnels, setCustomFunnels] = useState<Funnel[]>([]);
  const [persistentCustomFunnels, setPersistentCustomFunnels] = useState<Funnel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentFunnel, setCurrentFunnel] = useState<Funnel | null>(null);
  const [newFunnelName, setNewFunnelName] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Default funnel stages for Custom option
  const defaultFunnels: Funnel[] = [
    { id: "Awareness", name: "Awareness", color: colorPalette[0] },
    { id: "Consideration", name: "Consideration", color: colorPalette[1] },
    { id: "Conversion", name: "Conversion", color: colorPalette[2] },
    { id: "Loyalty", name: "Loyalty", color: colorPalette[3] },
  ];

  // Funnel stages for Targeting-Retargeting option
  const targetingRetargetingFunnels: Funnel[] = [
    { id: "Targeting", name: "Targeting", color: colorPalette[0] },
    { id: "Retargeting", name: "Retargeting", color: colorPalette[1] },
  ];

  // Store selections for each option type
  const [savedSelections, setSavedSelections] = useState<{
    custom: {
      funnel_stages: string[];
      channel_mix: { funnel_stage: string }[];
    };
    targeting_retargeting: {
      funnel_stages: string[];
      channel_mix: { funnel_stage: string }[];
    };
  }>({
    custom: { funnel_stages: [], channel_mix: [] },
    targeting_retargeting: { funnel_stages: [], channel_mix: [] },
  });

  // --- LocalStorage helpers for custom funnels, now scoped by cId ---
  const saveCustomFunnelsToStorage = (funnels: Funnel[]) => {
    try {
      if (!cId) return;
      localStorage.setItem(getLocalStorageFunnelsKey(cId), JSON.stringify(funnels));
    } catch (e) {
      // ignore
    }
  };
  const getCustomFunnelsFromStorage = (): Funnel[] | null => {
    try {
      if (!cId) return null;
      const data = localStorage.getItem(getLocalStorageFunnelsKey(cId));
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // On plan change (cId), clear out any in-memory state and ensure localStorage is plan-specific
  useEffect(() => {
    // Reset all funnel state when cId changes (i.e., new plan)
    setCustomFunnels([]);
    setPersistentCustomFunnels([]);
    setSavedSelections({
      custom: { funnel_stages: [], channel_mix: [] },
      targeting_retargeting: { funnel_stages: [], channel_mix: [] },
    });
    setSelectedOption("");
    // Don't clear modal state, as it's UI only
  }, [cId]);

  // Initialize comments drawer
  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, [setIsDrawerOpen, setClose]);

  // Validate funnel stages for step verification
  useEffect(() => {
    const isValid =
      Array.isArray(campaignFormData?.funnel_stages) &&
      campaignFormData.funnel_stages.length > 0;
    if (isValid !== previousValidationState) {
      verifyStep("step2", isValid, cId);
      setPreviousValidationState(isValid);
    }
  }, [campaignFormData, cId, verifyStep, previousValidationState]);

  // Initialize funnel data from campaignData and localStorage
  useEffect(() => {
    // Check if campaignData.custom_funnels contains Targeting/Retargeting
    const isTargetingRetargeting = campaignData?.custom_funnels?.every((funnel: any) =>
      ["Targeting", "Retargeting"].includes(funnel.name)
    );

    // Try to load custom funnels from localStorage first (scoped by cId)
    let loadedCustomFunnels: Funnel[] = [];
    let localStorageFunnels: Funnel[] | null = null;
    if (!isTargetingRetargeting) {
      localStorageFunnels = getCustomFunnelsFromStorage();
    }

    if (
      localStorageFunnels &&
      Array.isArray(localStorageFunnels) &&
      localStorageFunnels.length > 0 &&
      !isTargetingRetargeting
    ) {
      loadedCustomFunnels = localStorageFunnels;
    } else if (
      campaignData?.custom_funnels &&
      campaignData.custom_funnels.length > 0 &&
      !isTargetingRetargeting
    ) {
      loadedCustomFunnels = campaignData.custom_funnels.map((funnel: any, index: number) => ({
        id: funnel.id || funnel.name,
        name: funnel.name,
        color: funnel.color || colorPalette[index % colorPalette.length] || "bg-gray-500",
      }));
    } else {
      loadedCustomFunnels = defaultFunnels;
    }

    // Set persistent custom funnels to maintain order
    setPersistentCustomFunnels(loadedCustomFunnels);

    // Restore saved state from campaignData
    const initialFunnelType = campaignData?.funnel_type || "";
    const initialFunnelStages =
      campaignData?.funnel_stages && campaignData.funnel_stages.length > 0
        ? campaignData.funnel_stages
        : [];
    const initialChannelMix =
      campaignData?.channel_mix && campaignData.channel_mix.length > 0
        ? campaignData.channel_mix
        : [];

    setSelectedOption(initialFunnelType);

    if (initialFunnelType === "targeting_retargeting") {
      setCustomFunnels(targetingRetargetingFunnels);
      setSavedSelections((prev) => ({
        ...prev,
        targeting_retargeting: {
          funnel_stages: initialFunnelStages,
          channel_mix: initialChannelMix,
        },
      }));
    } else if (initialFunnelType === "custom") {
      setCustomFunnels(loadedCustomFunnels);
      setSavedSelections((prev) => ({
        ...prev,
        custom: {
          funnel_stages: initialFunnelStages,
          channel_mix: initialChannelMix,
        },
      }));
    }

    // Update campaignFormData with restored values, ensuring funnel_stages order matches loadedCustomFunnels
    setCampaignFormData((prev: any) => {
      const orderedFunnelStages =
        initialFunnelType === "custom" && initialFunnelStages.length > 0
          ? loadedCustomFunnels
            .map((f) => f.name)
            .filter((name) => initialFunnelStages.includes(name))
          : initialFunnelStages;
      const orderedChannelMix =
        initialFunnelType === "custom" && initialChannelMix.length > 0
          ? loadedCustomFunnels
            .map((f) => initialChannelMix.find((ch: any) => ch.funnel_stage === f.name))
            .filter((ch): ch is { funnel_stage: string } => ch !== undefined)
          : initialChannelMix;

      return {
        ...prev,
        funnel_type: initialFunnelType,
        funnel_stages: orderedFunnelStages,
        channel_mix: orderedChannelMix,
        custom_funnels: loadedCustomFunnels,
      };
    });
  // eslint-disable-next-line
  }, [campaignData, setCampaignFormData, cId]);

  // Whenever persistentCustomFunnels changes, update localStorage (scoped by cId)
  useEffect(() => {
    // Only save if not targeting/retargeting
    if (
      persistentCustomFunnels.length > 0 &&
      !persistentCustomFunnels.every((f) => ["Targeting", "Retargeting"].includes(f.name))
    ) {
      saveCustomFunnelsToStorage(persistentCustomFunnels);
    }
  // eslint-disable-next-line
  }, [persistentCustomFunnels, cId]);

  // Handle clicks outside modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // Get an available color from the palette
  const getAvailableColor = (excludeColor?: string): string => {
    const usedColors = persistentCustomFunnels
      .filter((f) => f.color !== excludeColor)
      .map((f) => f.color);
    // Only use colors that are not already used
    const availableColors = colorPalette.filter((c) => !usedColors.includes(c));
    // If all colors are used, pick a color in a round-robin fashion (shouldn't happen for <100 stages)
    return availableColors.length > 0
      ? availableColors[0]
      : colorPalette[persistentCustomFunnels.length % colorPalette.length];
  };

  // Handle funnel selection
  const handleSelect = (id: string) => {
    if (
      campaignFormData?.funnel_stages?.includes(id) &&
      campaignFormData.funnel_stages.length === 1
    ) {
      toast.error("You must have at least one stage selected", {
        duration: 3000,
      });
      return;
    }

    const newFunnelStages = campaignFormData?.funnel_stages
      ? campaignFormData.funnel_stages.includes(id)
        ? campaignFormData.funnel_stages.filter((name: string) => name !== id)
        : [...campaignFormData.funnel_stages, id]
      : [id];

    const newChannelMix = campaignFormData?.funnel_stages?.includes(id)
      ? campaignFormData.channel_mix.filter((ch: any) => ch?.funnel_stage !== id)
      : [...(campaignFormData?.channel_mix || []), { funnel_stage: id }];

    // Ensure funnel_stages order matches persistentCustomFunnels when adding a new stage
    const orderedFunnelStages = selectedOption === "custom"
      ? persistentCustomFunnels
        .map((f) => f.name)
        .filter((name) => newFunnelStages.includes(name))
      : newFunnelStages;

    // Ensure channel_mix order matches persistentCustomFunnels
    const orderedChannelMix = selectedOption === "custom"
      ? persistentCustomFunnels
        .map((f) => newChannelMix.find((ch: any) => ch.funnel_stage === f.name))
        .filter((ch): ch is { funnel_stage: string } => ch !== undefined)
      : newChannelMix;

    setCampaignFormData((prev: any) => ({
      ...prev,
      funnel_stages: orderedFunnelStages,
      channel_mix: orderedChannelMix,
    }));

    setSavedSelections((prev) => ({
      ...prev,
      [selectedOption]: {
        funnel_stages: orderedFunnelStages,
        channel_mix: orderedChannelMix,
      },
    }));
    setHasChanges(true);
  };

  // Handle option change (Custom vs Targeting-Retargeting)
  const handleOptionChange = (option: string) => {
    // Save current funnel_stages and channel_mix
    if (selectedOption) {
      setSavedSelections((prev) => ({
        ...prev,
        [selectedOption]: {
          funnel_stages: campaignFormData?.funnel_stages || [],
          channel_mix: campaignFormData?.channel_mix || [],
        },
      }));
    }

    setSelectedOption(option);

    if (option === "targeting_retargeting") {
      setCustomFunnels(targetingRetargetingFunnels);

      // Initialize with both stages selected by default for targeting-retargeting
      const defaultStages = ["Targeting", "Retargeting"];
      const defaultChannelMix = defaultStages.map(stage => ({ funnel_stage: stage }));

      setCampaignFormData((prev: any) => ({
        ...prev,
        funnel_type: "targeting_retargeting",
        funnel_stages: savedSelections.targeting_retargeting.funnel_stages.length > 0
          ? savedSelections.targeting_retargeting.funnel_stages
          : defaultStages,
        channel_mix: savedSelections.targeting_retargeting.channel_mix.length > 0
          ? savedSelections.targeting_retargeting.channel_mix
          : defaultChannelMix,
        custom_funnels: targetingRetargetingFunnels,
      }));
    } else {
      // Restore from localStorage if available, else from state
      let restoredFunnels: Funnel[] = [];
      const localStorageFunnels = getCustomFunnelsFromStorage();
      if (localStorageFunnels && Array.isArray(localStorageFunnels) && localStorageFunnels.length > 0) {
        restoredFunnels = localStorageFunnels;
      } else {
        restoredFunnels = persistentCustomFunnels.length > 0 ? persistentCustomFunnels : defaultFunnels;
      }
      setCustomFunnels(restoredFunnels);
      setPersistentCustomFunnels(restoredFunnels);
      setCampaignFormData((prev: any) => {
        const funnelStages =
          savedSelections.custom.funnel_stages.length > 0
            ? restoredFunnels
              .map((f) => f.name)
              .filter((name) => savedSelections.custom.funnel_stages.includes(name))
            : restoredFunnels.map((f) => f.name);
        const channelMix =
          savedSelections.custom.channel_mix.length > 0
            ? restoredFunnels
              .map((f) => savedSelections.custom.channel_mix.find((ch: any) => ch.funnel_stage === f.name))
              .filter((ch): ch is { funnel_stage: string } => ch !== undefined)
            : restoredFunnels.map((f) => ({ funnel_stage: f.name }));

        return {
          ...prev,
          funnel_type: "custom",
          custom_funnels: restoredFunnels,
          funnel_stages: funnelStages,
          channel_mix: channelMix,
        };
      });
    }

    setHasChanges(true);
  };

  // Add a new funnel
  const handleAddFunnel = (name: string) => {
    if (!name.trim()) {
      toast.error("Funnel name cannot be empty", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Funnel name must be at least 2 characters", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    if (!/[a-zA-Z]/.test(name)) {
      toast.error("Funnel name must include at least one letter", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    if (
      persistentCustomFunnels.some(
        (funnel) => funnel.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      toast.error("A funnel with this name already exists", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }

    const newColor = getAvailableColor();
    const newFunnel: Funnel = {
      id: name,
      name: name,
      color: newColor,
    };

    const updatedFunnels = [...persistentCustomFunnels, newFunnel];
    setPersistentCustomFunnels(updatedFunnels);
    setCustomFunnels(updatedFunnels);

    // Save to localStorage (scoped by cId)
    saveCustomFunnelsToStorage(updatedFunnels);

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: [...(prev.funnel_stages || []), name],
      channel_mix: [...(prev.channel_mix || []), { funnel_stage: name }],
    }));

    setSavedSelections((prev) => ({
      ...prev,
      custom: {
        funnel_stages: [...(prev.custom.funnel_stages || []), name],
        channel_mix: [...(prev.custom.channel_mix || []), { funnel_stage: name }],
      },
    }));

    setHasChanges(true);
    toast.success("Funnel added successfully", { duration: 3000 });
  };

  // Edit an existing funnel
  const handleEditFunnel = (oldId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error("Funnel name cannot be empty", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    if (
      persistentCustomFunnels.some(
        (funnel) =>
          funnel.name.toLowerCase() === newName.toLowerCase() &&
          funnel.name !== oldId
      )
    ) {
      toast.error("A funnel with this name already exists", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }

    const updatedFunnels = persistentCustomFunnels.map((f) =>
      f.name === oldId
        ? {
          ...f,
          id: newName,
          name: newName,
          color: f.color,
        }
        : f
    );

    setPersistentCustomFunnels(updatedFunnels);
    setCustomFunnels(updatedFunnels);

    // Save to localStorage (scoped by cId)
    saveCustomFunnelsToStorage(updatedFunnels);

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: prev.funnel_stages?.map((stage: string) =>
        stage === oldId ? newName : stage
      ) || [],
      channel_mix: prev.channel_mix?.map((ch: any) =>
        ch.funnel_stage === oldId ? { ...ch, funnel_stage: newName } : ch
      ) || [],
    }));

    setSavedSelections((prev) => ({
      ...prev,
      custom: {
        funnel_stages: prev.custom.funnel_stages.map((stage: string) =>
          stage === oldId ? newName : stage
        ),
        channel_mix: prev.custom.channel_mix.map((ch: any) =>
          ch.funnel_stage === oldId ? { ...ch, funnel_stage: newName } : ch
        ),
      },
    }));

    setHasChanges(true);
    toast.success("Funnel updated successfully", { duration: 3000 });
  };

  // Remove a funnel
  const handleRemoveFunnel = (id: string) => {
    if (persistentCustomFunnels.length <= 1) {
      toast.error("You must have at least one funnel stage", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }

    const updatedFunnels = persistentCustomFunnels.filter((f) => f.name !== id);
    setPersistentCustomFunnels(updatedFunnels);
    setCustomFunnels(updatedFunnels);

    // Save to localStorage (scoped by cId)
    saveCustomFunnelsToStorage(updatedFunnels);

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: prev.funnel_stages?.filter((name: string) => name !== id) || [],
      channel_mix: prev.channel_mix?.filter((ch: any) => ch?.funnel_stage !== id) || [],
    }));

    setSavedSelections((prev) => ({
      ...prev,
      custom: {
        funnel_stages: prev.custom.funnel_stages.filter((stage: string) => stage !== id),
        channel_mix: prev.custom.channel_mix.filter((ch: any) => ch?.funnel_stage !== id),
      },
    }));

    setHasChanges(true);
    toast.success("Funnel removed successfully", { duration: 3000 });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          className="text-[22px]"
          t1="How many funnel stage(s) would you like to activate to achieve your objective?"
        />
      </div>
      <div className="mt-[56px] flex items-center gap-[32px]">
        {[
          { id: "targeting_retargeting", label: "Targeting - Retargeting" },
          { id: "custom", label: "Custom" },
        ].map((option) => (
          <label
            key={option.id}
            className="cursor-pointer flex items-center gap-3"
          >
            <input
              type="radio"
              name="funnel_selection"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => handleOptionChange(option.id)}
              className="w-4 h-4"
            />
            <p className="font-semibold">{option.label}</p>
          </label>
        ))}
      </div>

      {selectedOption === "targeting_retargeting" && (
        <div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
          {targetingRetargetingFunnels.map((funnel) => {
            const isSelected = campaignFormData.funnel_stages?.includes(funnel.name);
            return (
              <div key={funnel.id} className="relative w-full max-w-[685px]">
                <button
                  className={`cursor-pointer w-full ${isSelected
                      ? `${funnel.color} text-white`
                      : "bg-white text-black shadow-md hover:bg-gray-100"
                    } rounded-lg py-4 flex items-center justify-center gap-2 transition-all duration-200`}
                  onClick={() => handleSelect(funnel.name)}
                >
                  <div className="w-6 h-6" />
                  <p className="text-[16px]">{funnel.name}</p>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedOption === "custom" && (
        <div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
          {customFunnels.map((funnel, index) => {
            const isSelected = campaignFormData.funnel_stages?.includes(funnel.name);
            return (
              <div
                key={`${funnel.id}-${index}`}
                className="relative w-full max-w-[685px]"
              >
                <button
                  className={`cursor-pointer w-full rounded-lg py-4 flex items-center justify-center gap-2 transition-all duration-200 ${isSelected
                      ? `${funnel.color} text-white`
                      : "bg-white text-black shadow-md hover:bg-gray-100"
                    }`}
                  onClick={() => handleSelect(funnel.name)}
                >
                  <div className="w-6 h-6" />
                  <p className="text-[16px]">{funnel.name}</p>
                </button>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <button
                    className="p-1 bg-white rounded-full shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalMode("edit");
                      setCurrentFunnel(funnel);
                      setNewFunnelName(funnel.name);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                  <button
                    className="p-1 bg-white rounded-full shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFunnel(funnel.name);
                    }}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
          <button
            className="flex items-center gap-2 text-blue-500 cursor-pointer text-[16px]"
            onClick={() => {
              setModalMode("add");
              setCurrentFunnel(null);
              setNewFunnelName("");
              setIsModalOpen(true);
            }}
          >
            <PlusIcon className="text-blue-500" />
            Add new funnel
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {modalMode === "add" ? "Add New Funnel" : "Edit Funnel"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label
                htmlFor="funnelName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="funnelName"
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter funnel name"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalMode === "add") {
                    handleAddFunnel(newFunnelName);
                  } else if (currentFunnel) {
                    handleEditFunnel(currentFunnel.name, newFunnelName);
                  }
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {modalMode === "add" ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFunnelStages;