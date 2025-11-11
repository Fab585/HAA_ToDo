<script lang="ts">
  import {
    notifications,
    dismissNotification,
    type NotificationType,
  } from "$lib/stores/notifications";
  import { fade, fly } from "svelte/transition";

  // Icon components for each type
  const icons: Record<NotificationType, string> = {
    success: "M5 13l4 4L19 7",
    error: "M6 18L18 6M6 6l12 12",
    warning:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  const colors: Record<
    NotificationType,
    { bg: string; border: string; text: string; icon: string }
  > = {
    success: {
      bg: "bg-green-50 dark:bg-green-900",
      border: "border-green-400 dark:border-green-600",
      text: "text-green-800 dark:text-green-200",
      icon: "text-green-500 dark:text-green-400",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900",
      border: "border-red-400 dark:border-red-600",
      text: "text-red-800 dark:text-red-200",
      icon: "text-red-500 dark:text-red-400",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900",
      border: "border-yellow-400 dark:border-yellow-600",
      text: "text-yellow-800 dark:text-yellow-200",
      icon: "text-yellow-500 dark:text-yellow-400",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900",
      border: "border-blue-400 dark:border-blue-600",
      text: "text-blue-800 dark:text-blue-200",
      icon: "text-blue-500 dark:text-blue-400",
    },
  };
</script>

<!-- Toast container -->
<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
  {#each $notifications as notification (notification.id)}
    <div
      transition:fly={{ y: 50, duration: 300 }}
      class="flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg {colors[notification.type]
        .bg} {colors[notification.type].border}"
      role="alert"
    >
      <!-- Icon -->
      <svg
        class="w-6 h-6 flex-shrink-0 {colors[notification.type].icon}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d={icons[notification.type]}
        />
      </svg>

      <!-- Message -->
      <div class="flex-1 {colors[notification.type].text}">
        <p class="text-sm font-medium">{notification.message}</p>
      </div>

      <!-- Dismiss button -->
      <button
        on:click={() => dismissNotification(notification.id)}
        class="flex-shrink-0 {colors[notification.type]
          .text} opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  {/each}
</div>
