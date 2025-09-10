<template>
    <h2 class="auth-title titleExtra32px">{{ title }}</h2>
</template>

<script setup>
    const props = defineProps({ title: String })
</script>

<style scoped>
.auth-title {
    margin-top: 16px;
    margin-left: 32px;
    margin-bottom: 32px;
    color: var(--color-primary);
}
</style>