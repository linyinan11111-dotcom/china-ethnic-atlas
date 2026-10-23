<script setup lang="ts">
defineProps<{ name: string }>();
</script>
<template>
  <div class="landscape">
    <svg
      viewBox="0 0 400 170"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="sky"
          x2="0"
          y2="1"
        >
          <stop stop-color="var(--theme-light, #e4eadd)" />
          <stop
            offset="1"
            stop-color="#f1eddb"
          />
        </linearGradient>
        <linearGradient
          id="hill"
          x2="1"
          y2="1"
        >
          <stop stop-color="var(--theme-hill, #68967a)" />
          <stop
            offset="1"
            stop-color="var(--theme-ink, #375f4b)"
          />
        </linearGradient>
      </defs>
      <rect
        width="400"
        height="170"
        fill="url(#sky)"
      />
      <circle
        cx="313"
        cy="40"
        r="23"
        fill="#e7c788"
        opacity=".8"
      />
      <path
        d="M-30 135Q10 63 59 80T151 63T248 72T334 48T450 115V170H-30Z"
        fill="var(--theme-tint, #b8cbb7)"
      />
      <path
        d="M-30 164Q30 104 92 118T178 91T280 102T419 83V180H-30Z"
        fill="var(--theme-middle, #87aa8e)"
      />
      <path
        d="M-30 178Q53 141 103 145T208 111T314 141T439 118V190H-30Z"
        fill="url(#hill)"
      />
      <g
        fill="none"
        stroke="#e3e5c4"
        stroke-width="1.2"
        opacity=".45"
      >
        <path d="M33 153q56-15 85-5t75-14 61 4 106 6" />
        <path d="M12 165q63-19 107-5t75-15 67 5 113 6" />
        <path d="M89 170q27 4 78-9t83 0 98 5" />
      </g>
      <path
        d="M198 130h26v15h-26Z"
        fill="#e5debd"
      />
      <path
        d="m194 132 18-13 18 13Z"
        fill="#3d5a46"
      />
      <path
        d="M209 135h6v10h-6Z"
        fill="#59684a"
      />
    </svg>
    <span class="landscape-label">
      {{ name }}
      <small>山河同心 · 文化概览</small>
    </span>
  </div>
</template>
