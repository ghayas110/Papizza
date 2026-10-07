export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

export const buttonStyles = {
  primary:
    "inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-tomato px-6 text-[15px] font-semibold text-tomato-ink shadow-[0_10px_30px_-12px_rgba(201,56,42,0.7)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-tomato-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  ghost:
    "inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-cream/15 bg-cream/[0.03] px-6 text-[15px] font-semibold text-cream transition-[background-color,border-color,transform] duration-200 hover:border-cream/30 hover:bg-cream/[0.07] active:scale-[0.97] cursor-pointer",
  whatsapp:
    "inline-flex h-13 items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-whatsapp px-6 text-[15px] font-semibold text-whatsapp-ink transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  icon:
    "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-cream transition-[background-color,transform] duration-200 hover:bg-cream/[0.08] active:scale-[0.94] cursor-pointer",
};
