// app/components/signup-form.tsx
import { useState } from "react";
import { authApi } from "~/lib/api";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const checkPasswordStrength = (password: string) => {
  let score = -1;
  let feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push("At least 8 characters");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("One lowercase letter");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("One uppercase letter");

  if (/\d/.test(password)) score += 1;
  else feedback.push("One number");

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push("One special character");

  const strength = ["Very Weak", "Weak", "Fair", "Good", "Strong"][score];
  const color = [
    "text-red-500",
    "text-red-400",
    "text-yellow-500",
    "text-green-400",
    "text-green-500",
  ][score];
  const bgColor = [
    "bg-red-500",
    "bg-red-400",
    "bg-yellow-500",
    "bg-green-400",
    "bg-green-500",
  ][score];

  return { score, strength, color, bgColor, feedback };
};

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
    general: "",
  });

  // Validation function
  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
      general: "",
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 255) {
      newErrors.name = "Name must be less than 255 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name.trim())) {
      newErrors.name =
        "Name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 255) {
      newErrors.email = "Email must be less than 255 characters";
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 20) {
      newErrors.username = "Username must be less than 20 characters";
    } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, dots, and underscores";
    } else if (
      formData.username.startsWith(".") ||
      formData.username.endsWith(".")
    ) {
      newErrors.username = "Username cannot start or end with a dot";
    } else if (formData.username.includes("..")) {
      newErrors.username = "Username cannot contain consecutive dots";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length > 255) {
      newErrors.password = "Password must be less than 255 characters";
    }

    // Validate password confirmation
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = "Please confirm your password";
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const passwordStrength = checkPasswordStrength(formData.password);
  const passwordsMatch =
    formData.password === formData.passwordConfirm &&
    formData.passwordConfirm !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    // if (formData.password !== formData.passwordConfirm) {
    //   toast.error("Passwords do not match");
    //   return;
    // }

    // Check password strength (optional - you can remove this if you want to allow weak passwords)
    // if (passwordStrength.score < 4) {
    //   return;
    // }

    // Clear previous errors
    setErrors({
      name: "",
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
      general: "",
    });

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { passwordConfirm, ...registrationData } = formData;
      await authApi.register(registrationData);

      toast.success(
        "Registration successful! Please login with your credentials."
      );

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        // Handle specific API errors
        if (errorMessage.includes("email already used")) {
          setErrors((prev) => ({
            ...prev,
            email: "This email is already registered",
          }));
        } else if (errorMessage.includes("username already used")) {
          setErrors((prev) => ({
            ...prev,
            username: "This username is already used",
          }));
        } else {
          setErrors((prev) => ({ ...prev, general: error.message }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Registration failed. Please try again.",
        }));
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear field error when user starts typing
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-16 items-center justify-center rounded-md">
                <img
                  src="/assets/images/logo-me-red.png"
                  alt="Mata Elang Logo"
                  className="size-12"
                />
              </div>
              <span className="sr-only">Mata Elang</span>
            </a>
            <h1 className="text-xl font-bold">Join Mata Elang</h1>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Sign in
              </a>
            </div>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className={
                  errors.name ? "border-red-500 focus:border-red-500" : ""
                }
                required
                minLength={3}
                maxLength={255}
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                className={
                  errors.email ? "border-red-500 focus:border-red-500" : ""
                }
                required
                maxLength={255}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleFieldChange("username", e.target.value)}
                className={
                  errors.username ? "border-red-500 focus:border-red-500" : ""
                }
                required
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9._]+$"
                title="Username can only contain letters, numbers, dots, and underscores"
              />
              {errors.username && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.username}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  className={
                    errors.password ? "border-red-500 focus:border-red-500" : ""
                  }
                  required
                  minLength={8}
                  maxLength={255}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 012.62-3.95m3.38-2.6A9.956 9.956 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-2.62 3.95m-3.38 2.6A9.956 9.956 0 0112 19c-1.07 0-2.1-.13-3.08-.37M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}

              {/* Password Strength Indicator - ALWAYS show when user starts typing */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Password strength:
                    </span>
                    <span
                      className={`text-xs font-medium ${passwordStrength.color}`}
                    >
                      {passwordStrength.strength}
                    </span>
                  </div>
                  {/* Progress bars - ALWAYS show */}
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-2 w-full rounded-full ${
                          level <= passwordStrength.score
                            ? passwordStrength.bgColor
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  {/* Text feedback */}
                  {passwordStrength.feedback.length > 0 ? (
                    <div className="text-xs text-red-600">
                      Missing: {passwordStrength.feedback.join(", ")}
                    </div>
                  ) : passwordStrength.score === 4 ? (
                    <div className="text-xs text-green-600">
                      ✓ All requirements met - Strong password!
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="passwordConfirm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.passwordConfirm || ""}
                  onChange={(e) =>
                    handleFieldChange("passwordConfirm", e.target.value)
                  }
                  required
                  className={
                    formData.passwordConfirm && !passwordsMatch
                      ? "border-red-500 focus:border-red-500"
                      : formData.passwordConfirm && passwordsMatch
                        ? "border-green-500 focus:border-green-500"
                        : ""
                  }
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPasswordConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label={
                    showPasswordConfirm
                      ? "Hide password confirmation"
                      : "Show password confirmation"
                  }
                >
                  {showPasswordConfirm ? (
                    // Eye-off icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 012.62-3.95m3.38-2.6A9.956 9.956 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-2.62 3.95m-3.38 2.6A9.956 9.956 0 0112 19c-1.07 0-2.1-.13-3.08-.37M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.passwordConfirm}
                </p>
              )}

              {/* Password Match Indicator */}
              {formData.passwordConfirm && !errors.passwordConfirm && (
                <div className="flex items-center space-x-2">
                  {passwordsMatch ? (
                    <>
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-xs text-green-600">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-xs text-red-600">
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <Button variant="outline" type="button" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="outline" type="button" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By creating an account, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
