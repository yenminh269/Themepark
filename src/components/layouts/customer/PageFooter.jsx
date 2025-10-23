
import './Homepage.css'
export default function PageFooter(){
    return (
      <footer className="!text-center !py-6 !text-sm !text-slate-600 !bg-[#EEF5FF]">
        © {new Date().getFullYear()} ThemePark • 3380 Project
      </footer>
    )
}