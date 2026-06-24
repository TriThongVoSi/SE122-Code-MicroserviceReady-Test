import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, useNavigate, Routes, Route } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ScrollToTop } from "./ScrollToTop";

function NavButton() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/page2")}>
      Go to Page 2
    </button>
  );
}

describe("ScrollToTop component", () => {
  it("calls window.scrollTo when the pathname changes", async () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/page1"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/page1" element={<NavButton />} />
          <Route path="/page2" element={<div>Page 2</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Initial render should call scrollTo (pathname changes from empty/nothing to /page1)
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockClear();

    // Click navigation button
    const button = screen.getByRole("button", { name: "Go to Page 2" });
    await act(async () => {
      button.click();
    });

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockRestore();
  });
});
