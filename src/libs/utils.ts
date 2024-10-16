export const navigateByKeyboard = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement & { localName: string };
  // Check if the focus is not on an input element
  if (
    !(
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      target?.localName === "trix-editor"
    )
  ) {
    if (event.key === "1") {
      window.location.href = "/dashboard";
    } else if (event.key === "2") {
      window.location.href = "/dashboard/posts";
    } else if (event.key === "3") {
      window.location.href = "/dashboard/contacts";
    }
  }
};

export const setupKeyboardNavigation = () => {
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    navigateByKeyboard(event);
  });
};
