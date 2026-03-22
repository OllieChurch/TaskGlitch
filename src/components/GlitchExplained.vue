<template>
	<div class="flex flex-col items-center justify-center text-center py-8">
		<div class="mb-6">
			<glitch-emblem :size="96" />
		</div>
		<h1 class="mb-2 font-rajdhani font-bold text-3xl text-text-heading">
			Ready to focus?
		</h1>
		<p class="mb-8 font-rajdhani text-text-secondary max-w-sm">
			Turn your backlog into a focused work session in seconds
		</p>

		<!-- Steps -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-lg">
			<div class="depth-panel border border-border-visible rounded-lg p-4">
				<p class="font-wallpoet text-accent text-sm mb-2">01</p>
				<p class="font-rajdhani font-semibold text-text-heading text-sm mb-1">Scored & ranked</p>
				<p class="font-rajdhani text-text-secondary text-xs mb-0">
					Priority, age, and deadline proximity
				</p>
			</div>
			<div class="depth-panel border border-border-visible rounded-lg p-4">
				<p class="font-wallpoet text-accent text-sm mb-2">02</p>
				<p class="font-rajdhani font-semibold text-text-heading text-sm mb-1">Scheduled</p>
				<p class="font-rajdhani text-text-secondary text-xs mb-0">
					Optimised sessions with built-in breaks
				</p>
			</div>
			<div class="depth-panel border border-border-visible rounded-lg p-4">
				<p class="font-wallpoet text-accent text-sm mb-2">03</p>
				<p class="font-rajdhani font-semibold text-text-heading text-sm mb-1">Tracked</p>
				<p class="font-rajdhani text-text-secondary text-xs mb-0">
					Complete tasks and sharpen your estimates
				</p>
			</div>
		</div>

		<button
			class="btn-themed bg-accent text-text-inverse font-bold py-3 px-8 text-lg hover:brightness-110 font-rajdhani transition-all"
			@click="$emit('createSchedule')"
		>
			Glitch It!
		</button>
	</div>
</template>

<script>
import GlitchEmblem from '@/components/GlitchEmblem.vue'

export default {
	emits: ['createSchedule'],
	components: {
		GlitchEmblem
	}
}
</script>
