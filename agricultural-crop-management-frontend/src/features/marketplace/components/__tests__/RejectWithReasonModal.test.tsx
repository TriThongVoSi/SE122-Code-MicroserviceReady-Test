import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RejectWithReasonModal } from "../RejectWithReasonModal";

describe("RejectWithReasonModal", () => {
  it("renders with title and description when open", () => {
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Hide Product"
        description="This product will be hidden from the marketplace."
        reasonLabel="Reason for hiding"
      />
    );

    expect(screen.getByText("Hide Product")).toBeInTheDocument();
    expect(screen.getByText("This product will be hidden from the marketplace.")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for hiding")).toBeInTheDocument();
  });

  it("shows validation error for short reason", async () => {
    const user = userEvent.setup();
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Hide Product"
        description="Warning text"
        reasonLabel="Reason"
      />
    );

    const textarea = screen.getByLabelText("Reason");
    await user.type(textarea, "Short");

    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  it("disables confirm button until valid reason entered", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Hide Product"
        description="Warning text"
        reasonLabel="Reason"
      />
    );

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toBeDisabled();

    const textarea = screen.getByLabelText("Reason");
    await user.type(textarea, "This is a valid reason with enough characters");

    expect(confirmButton).toBeEnabled();
  });

  it("calls onConfirm with reason when submitted", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Hide Product"
        description="Warning text"
        reasonLabel="Reason"
      />
    );

    const textarea = screen.getByLabelText("Reason");
    await user.type(textarea, "Valid rejection reason");

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith("Valid rejection reason");
  });

  it("shows character counter", async () => {
    const user = userEvent.setup();
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Hide Product"
        description="Warning text"
        reasonLabel="Reason"
      />
    );

    expect(screen.getByText("0 / 500")).toBeInTheDocument();

    const textarea = screen.getByLabelText("Reason");
    await user.type(textarea, "Test");

    expect(screen.getByText("4 / 500")).toBeInTheDocument();
  });

  it("trims whitespace from reason before calling onConfirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Hide Product"
        description="Warning text"
        reasonLabel="Reason"
      />
    );

    const textarea = screen.getByLabelText("Reason");
    await user.type(textarea, "  Valid reason text  ");

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith("Valid reason text");
  });
});
