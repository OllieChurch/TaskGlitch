<template>
	<div>
		<div class="flex items-center justify-between">
			<h5 class="text-left mb-3 font-rajdhani font-semibold text-text-heading">Schedule</h5>
			<label
				v-if="!isSimpleSchedule"
				class="relative inline-flex items-center cursor-pointer mb-3"
			>
				<input
					type="checkbox"
					v-model="isEditMode"
					class="sr-only peer"
				/>
				<div class="w-11 h-6 bg-surface-hover rounded-full peer peer-checked:bg-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-text-primary after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
				<span class="ml-2 text-sm font-rajdhani">edit</span>
			</label>
		</div>

		<!-- Edit mode -->
		<div v-if="isEditMode && scheduleDetails?.tasks">
			<!-- Completed tasks (static, not draggable) -->
			<div
				v-for="task in completedScheduleTasks"
				:key="`schedule-completed-${task.id}`"
				class="flex items-center schedule-item"
			>
				<p
					class="w-3/12 text-left mb-0"
					:class="isSimpleSchedule ? 'text-lg' : 'text-2xl'"
				>
					{{ task.time }}
				</p>
				<div class="my-2 p-2 bg-surface-hover rounded-lg shadow-sm border border-border-default w-9/12 opacity-60">
					<div class="flex items-center justify-between">
						<h5
							class="text-left mb-0 pl-0 pr-2 w-full font-rajdhani font-semibold completed-task"
						>
							{{ task.name }}
						</h5>
					</div>
				</div>
			</div>

			<!-- Divider between completed and remaining in edit mode -->
			<div
				v-if="hasCompletedTasks && remainingScheduleTasks.length > 0"
				class="flex items-center my-3"
			>
				<div class="flex-1 border-t border-border-default"></div>
				<span class="px-3 text-sm text-text-secondary font-rajdhani font-semibold">Remaining Tasks</span>
				<div class="flex-1 border-t border-border-default"></div>
			</div>

			<!-- Remaining tasks (draggable) -->
			<VueDraggable
				v-model="remainingScheduleTasks"
				handle=".grab-handle"
				@update="onDragUpdate"
			>
				<div
					v-for="task in remainingScheduleTasks"
					:key="`schedule-${task.id}`"
					class="flex items-center schedule-item"
				>
					<p
						class="w-3/12 text-left mb-0"
						:class="isSimpleSchedule ? 'text-lg' : 'text-2xl'"
					>
						{{ task.time }}
					</p>
					<div class="my-2 p-2 bg-surface-raised rounded-lg shadow-sm border border-border-default w-9/12">
						<div class="flex items-center justify-between">
							<div class="w-1/12 pl-0 pr-3 grab-handle">
								<GripHorizontal :size="16" />
							</div>
							<h5
								class="text-left mb-0 pl-0 font-rajdhani font-semibold flex-1 min-w-0 truncate"
								:class="task.type === taskType.systemBreak ? 'pr-1' : 'pr-2'"
							>
								{{ task.name }}
							</h5>
							<div v-if="task.type === taskType.systemBreak" class="flex items-center gap-1 shrink-0">
								<input
									type="number"
									:value="task.sizing"
									min="5"
									max="120"
									step="5"
									class="w-12 border border-border-default bg-surface-base text-text-primary rounded px-1.5 py-0.5 text-xs font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
									@change="updateBreakDuration(task, $event.target.value)"
								/>
								<span class="text-[10px] text-text-secondary font-rajdhani">m</span>
							</div>
							<div class="w-2/12" v-if="!isSimpleSchedule">
								<button
									v-if="!task.completed"
									class="btn-themed bg-accent text-text-inverse px-2 py-1 hover:brightness-110"
									@click="removeFromSchedule(task)"
								>
									<X :size="14" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</VueDraggable>
		</div>

		<!-- View mode -->
		<div v-else>
			<template
				v-for="task in scheduleDetails?.tasks"
				:key="`schedule-${task.id}`"
			>
				<div v-if="shouldDisplayDate(task)">
					<h5 class="mt-3 mb-1 text-left font-rajdhani font-semibold text-text-heading">
						{{ task.date }}
					</h5>
				</div>

				<!-- Divider between completed and remaining in view mode -->
				<div
					v-if="task.isFirstRemaining && hasCompletedTasks"
					class="flex items-center my-3"
				>
					<div class="flex-1 border-t border-border-default"></div>
					<span class="px-3 text-sm text-text-secondary font-rajdhani font-semibold">Remaining Tasks</span>
					<div class="flex-1 border-t border-border-default"></div>
				</div>

				<div class="flex items-center schedule-item">
					<p
						class="w-3/12 text-left mb-0 shrink-0"
						:class="[
							isSimpleSchedule ? 'text-lg' : 'text-2xl',
							task.completed ? 'text-text-secondary/50' : ''
						]"
					>
						{{ task.completed ? '' : task.time }}
					</p>
					<div
						class="my-2 p-2 rounded-lg shadow-sm border w-9/12"
						:class="task.isActive ? 'bg-accent/10 border-accent' : 'bg-surface-raised border-border-default'"
					>
						<div class="flex items-center justify-between">
							<div class="flex-1 pr-2 flex items-center gap-2">
								<h5
									class="text-left mb-0 pl-0 font-rajdhani font-semibold"
									:class="task.completed ? 'completed-task' : ''"
								>
									{{ task.name }}
								</h5>
								<span
									v-if="task.isActive"
									class="inline-flex items-center shrink-0 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full font-rajdhani font-semibold"
								>
									<span class="w-1.5 h-1.5 bg-accent rounded-full mr-1 animate-pulse"></span>
									In Progress
								</span>
							</div>
							<div class="shrink-0" v-if="!isSimpleSchedule">
								<button
									:class="task.completed
										? 'bg-app-warning text-text-inverse hover:brightness-110'
										: 'bg-app-success text-text-inverse hover:brightness-110'"
									class="btn-themed px-2 py-1 transition-all"
									@click="toggleCompleted(task)"
								>
									<Undo2 v-if="task.completed" :size="16" />
									<CheckCircle2 v-else :size="16" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
		<div v-if="isEditMode" class="mt-3">
			<button
				class="w-full btn-themed flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-rajdhani font-semibold bg-surface-hover border border-dashed border-border-visible text-text-secondary hover:border-accent-dim hover:text-text-primary transition-all rounded-lg"
				@click="addBreak()"
			>
				<Plus :size="14" />
				Add Break
			</button>
		</div>
		<div class="mt-3 depth-panel depth-highlight p-3 rounded-lg border border-border-visible">
			<div class="flex items-center" :class="isEditMode ? 'justify-between' : 'justify-center'">
				<h5 class="mb-0 font-rajdhani font-semibold text-text-heading">
					Estimated Finish
					{{ scheduleDetails.estimatedFinishTime }}
				</h5>
			</div>
			<div v-if="scheduleEndTime && isEditMode" class="flex items-center justify-between mt-2 pt-2 border-t border-border-default">
				<span class="font-rajdhani text-sm text-text-secondary">
					Schedule ends at
				</span>
				<input
					v-if="isEditMode"
					type="time"
					:value="scheduleEndTime"
					class="border border-border-default bg-surface-base text-text-primary rounded px-2 py-0.5 text-sm font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
					@change="updateFinishTime($event.target.value)"
				/>
				<span v-else class="font-rajdhani text-sm text-text-heading font-semibold">
					{{ scheduleEndTimeFormatted }}
				</span>
			</div>
		</div>
		<div v-if="scheduleDetails.isOverflowing" class="mt-2 p-3 bg-amber-900/30 border border-amber-600 rounded-lg text-left">
			<p class="font-rajdhani font-semibold text-amber-300 mb-0">
				<AlertTriangle :size="16" class="inline mr-1" /> Schedule runs past end time
			</p>
		</div>
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import { logger } from '@/utils/logger'
import { VueDraggable } from 'vue-draggable-plus'
import { GripHorizontal, X, Undo2, CheckCircle2, AlertTriangle, Plus } from 'lucide-vue-next'

export default {
	components: { VueDraggable, GripHorizontal, X, Undo2, CheckCircle2, AlertTriangle, Plus },
	props: ['isSimpleSchedule'],
	emits: ['scheduleChanged'],

	setup() {
		const store = useAppStore()
		const { moveTask, saveScheduleToDatabase, createGuid } = useTaskActions()
		return { store, moveTask, saveScheduleToDatabase, createGuid }
	},

	data() {
		return {
			isEditMode: false
		}
	},

	computed: {
		getPrioritisedTasks() {
			return this.store.getPrioritisedTasks
		},

		debug() {
			return this.store.debug
		},

		scheduleDetails() {
			const schedule = this.store.schedule

			if (schedule && schedule.tasks) {
				const startDateTime = new Date(schedule.start)
				let taskTime = new Date(startDateTime)
				const now = new Date()
				const scheduleStarted = now >= startDateTime
				const isPaused = !!schedule.paused

				// Single pass: compute display times, active task, and first-remaining marker together
				// so slot positions and active detection can never drift out of sync
				let activeTaskId = null
				let firstRemainingFound = false

				// Two-pass approach: first compute completed status, then determine active task.
				// The active task is the first non-completed user task whose time slot contains
				// "now", OR (after a reschedule) simply the first non-completed user task if the
				// schedule has started — since completed tasks may still occupy early time slots
				// before their completion triggered a reschedule.

				// Pre-compute completed status for all tasks
				schedule.tasks.forEach(task => {
					if (
						task.type == null ||
						task.type === this.taskType.userTask
					) {
						task.completed = !this.getPrioritisedTasks.find(
							x => x.id === task.id
						)
					}
				})

				// Determine active task: the first non-completed user task in the schedule.
				// The marker stays on the current task until it's actually completed,
				// regardless of whether the time slot has elapsed.
				if (scheduleStarted && !isPaused) {
					const firstRemaining = schedule.tasks.find(
						t => !t.completed && (t.type == null || t.type === this.taskType.userTask)
					)
					if (firstRemaining) {
						activeTaskId = firstRemaining.id
					}
				}

				let usedActualStart = false
				schedule.tasks.forEach(task => {
					if (task.completed && task.completedTime) {
						// Completed task with stored time — preserve it
						task.time = task.completedTime
						task.date = task.completedDate || taskTime.toDateString()
					} else {
						// Only the first non-completed task with actualStartTime
						// resets the clock — prevents stale values on later tasks
						if (!usedActualStart && task.actualStartTime) {
							taskTime = new Date(task.actualStartTime)
							usedActualStart = true
						}

						task.time = taskTime.toLocaleTimeString([], {
							timeStyle: 'short'
						})
						task.date = taskTime.toDateString()

						taskTime = new Date(
							taskTime.setMinutes(
								taskTime.getMinutes() + task.sizing
							)
						)
					}

					task.isActive = task.id === activeTaskId

					// Mark the first non-completed task for divider placement
					if (!firstRemainingFound && !task.completed) {
						task.isFirstRemaining = true
						firstRemainingFound = true
					} else {
						task.isFirstRemaining = false
					}
				})

				schedule.estimatedFinishTime = taskTime.toLocaleTimeString(
					[],
					{
						timeStyle: 'short'
					}
				)

				// Detect if schedule overflows past the planned end time
				if (schedule.finish) {
					const scheduledFinish = new Date(schedule.finish)
					schedule.isOverflowing = taskTime > scheduledFinish
				} else {
					schedule.isOverflowing = false
				}
			}

			logger.log('scheduleDetails: ', schedule)
			return schedule
		},

		taskType() {
			return this.store.taskType
		},

		scheduleEndTime() {
			if (!this.store.schedule?.finish) return null
			const finish = new Date(this.store.schedule.finish)
			const hours = finish.getHours().toString().padStart(2, '0')
			const mins = finish.getMinutes().toString().padStart(2, '0')
			return `${hours}:${mins}`
		},

		scheduleEndTimeFormatted() {
			if (!this.store.schedule?.finish) return ''
			return new Date(this.store.schedule.finish).toLocaleTimeString([], { timeStyle: 'short' })
		},

		hasCompletedTasks() {
			if (!this.scheduleDetails?.tasks) return false
			return this.scheduleDetails.tasks.some(t =>
				(t.type == null || t.type === this.taskType.userTask) && t.completed
			)
		},

		completedScheduleTasks() {
			if (!this.scheduleDetails?.tasks) return []
			return this.scheduleDetails.tasks.filter(t => t.completed)
		},

		remainingScheduleTasks: {
			get() {
				if (!this.scheduleDetails?.tasks) return []
				return this.scheduleDetails.tasks.filter(t => !t.completed)
			},
			set(newRemaining) {
				// Reconstruct full task list: completed + reordered remaining
				const completed = this.scheduleDetails.tasks.filter(t => t.completed)
				this.scheduleDetails.tasks = [...completed, ...newRemaining]
			}
		}
	},

	methods: {
		toggleCompleted(task) {
			if (task.type == null || task.type === this.taskType.userTask) {
				const isCompleting = !task.completed
				const now = new Date().toISOString()

				if (isCompleting) {
					// Record end time on the completing task
					const scheduleTask = this.scheduleDetails.tasks.find(x => x.id === task.id)
					if (scheduleTask) {
						// Snapshot original start time so undo can restore it
						scheduleTask.originalStartTime = scheduleTask.actualStartTime

						scheduleTask.actualEndTime = now
						if (scheduleTask.actualStartTime) {
							scheduleTask.actualDuration = Math.round(
								(new Date(now) - new Date(scheduleTask.actualStartTime)) / 1000 / 60
							)
						}

						// Copy timing data onto the task so moveTask carries it to Firebase
						task.actualStartTime = scheduleTask.actualStartTime
						task.actualEndTime = scheduleTask.actualEndTime
						task.actualDuration = scheduleTask.actualDuration
					}

					// Set start time on the next non-completed user task
					const nextTask = this.scheduleDetails.tasks.find(
						t => t.id !== task.id &&
							!t.completed &&
							(t.type == null || t.type === this.taskType.userTask)
					)
					if (nextTask) {
						nextTask.actualStartTime = now
					}

					// Persist timing data to schedule in Firebase
					this.updateSchedule(this.scheduleDetails)

					// Notify parent to auto-reschedule, passing the just-completed task ID
					this.$emit('scheduleChanged', { completedTaskId: task.id })
				} else {
					// Undoing a completion — restore task to its original position
					// instead of triggering a full reschedule
					const scheduleTask = this.scheduleDetails.tasks.find(x => x.id === task.id)
					if (scheduleTask) {
						// Restore original start time and clear completion timing
						scheduleTask.actualStartTime = scheduleTask.originalStartTime || scheduleTask.actualStartTime
						delete scheduleTask.actualEndTime
						delete scheduleTask.actualDuration
						delete scheduleTask.completedTime
						delete scheduleTask.completedDate
						delete scheduleTask.originalStartTime
					}

					// Save directly without triggering a full reschedule
					this.updateSchedule(this.scheduleDetails)
				}

				const list = task.completed ? 'tasks' : 'completed'
				this.moveTask(task, list)
			}

			if (task.type === this.taskType.systemBreak) {
				let newSchedule = this.scheduleDetails
				newSchedule.tasks.find(x => x.id === task.id).completed =
					!task.completed
				this.updateSchedule(newSchedule)
			}
		},

		removeFromSchedule(task) {
			let newSchedule = this.scheduleDetails
			const taskToRemoveIndex = newSchedule.tasks.findIndex(
				x => x.id === task.id
			)

			if (taskToRemoveIndex > -1) {
				newSchedule.tasks.splice(taskToRemoveIndex, 1)

				// Track excluded task IDs so they aren't re-suggested on reschedule
				if (task.type == null || task.type === this.taskType.userTask) {
					if (!newSchedule.excludedTaskIds) newSchedule.excludedTaskIds = []
					newSchedule.excludedTaskIds.push(task.id)
				}

				this.updateSchedule(newSchedule)
			}
		},

		updateFinishTime(timeValue) {
			if (!timeValue || !this.store.schedule?.finish) return
			const currentFinish = new Date(this.store.schedule.finish)
			const [hours, mins] = timeValue.split(':').map(Number)
			currentFinish.setHours(hours, mins, 0, 0)

			const newSchedule = this.scheduleDetails
			newSchedule.finish = currentFinish.toISOString()
			this.updateSchedule(newSchedule)
		},

		updateBreakDuration(task, value) {
			const newDuration = Math.max(5, Math.min(120, parseInt(value) || 10))
			const scheduleTask = this.scheduleDetails.tasks.find(x => x.id === task.id)
			if (scheduleTask) {
				scheduleTask.sizing = newDuration
				this.updateSchedule(this.scheduleDetails)
			}
		},

		addBreak() {
			const breakLength = this.store.getAccountSettings.breaks?.length ?? 10
			const newBreak = {
				id: this.createGuid(),
				name: 'Take a break',
				sizing: breakLength,
				type: this.taskType.systemBreak
			}

			// Clear stale actualStartTime on remaining tasks so times recalculate
			// correctly with the new break included
			this.scheduleDetails.tasks.forEach(t => {
				if (!t.completed) delete t.actualStartTime
			})

			// Append to end of remaining tasks — user can drag it into position
			this.scheduleDetails.tasks.push(newBreak)
			this.updateSchedule(this.scheduleDetails)
		},

		onDragUpdate() {
			// Clear stale actualStartTime so times recalculate after reorder
			this.scheduleDetails.tasks.forEach(t => {
				if (!t.completed) delete t.actualStartTime
			})
			this.updateSchedule(this.scheduleDetails)
		},

		updateSchedule(newSchedule) {
			logger.log('new schedule: ', newSchedule)
			this.saveScheduleToDatabase(newSchedule)
			this.store.setSchedule(newSchedule)
		},

		shouldDisplayDate(task) {
			const schedule = this.scheduleDetails
			const taskIndex = schedule.tasks.findIndex(x => x.id == task.id)
			return taskIndex > 0
				? schedule.tasks[taskIndex - 1].date != task.date
				: true
		}
	}
}
</script>

<style scoped>
.completed-task {
	text-decoration: line-through;
	opacity: 0.5;
}

.grab-handle {
	cursor: grab;
}
</style>
