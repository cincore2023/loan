import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  // 直接重定向到H5页面
  redirect('/h5');
  
  // 这一行不会被执行，但为了满足React组件的要求保留
  return null;
}
