<template>
	<div class="md:flex md:flex-col md:h-full md:min-h-0">
		<content-card>
			<!-- Command Center Header -->
			<h1 class="text-left mt-2 mb-2 font-rajdhani font-bold text-sm text-text-heading section-header uppercase tracking-widest shrink-0">Command Center</h1>
			<hr class="accent-divider mb-5 mt-2 shrink-0" />

			<!-- Loading state -->
			<div v-if="isLoading">
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
					<skeleton-loader v-for="n in 4" :key="n" :lines="1" height="4rem" />
				</div>
				<skeleton-loader :lines="2" height="4.5rem" />
				<div class="mt-6">
					<skeleton-loader :lines="1" height="1.2rem" />
					<div class="mt-4 flex justify-center">
						<skeleton-loader :lines="1" height="12rem" />
					</div>
				</div>
			</div>

			<!-- Empty state -->
			<div v-else-if="!hasTasks" class="py-8 text-text-secondary font-rajdhani">
				<p class="text-lg font-semibold">No tasks yet</p>
				<p class="text-sm">Add your first task to see your dashboard come to life.</p>
			</div>

			<!-- Data loaded -->
			<div v-else class="md:flex-1 md:min-h-0 md:overflow-y-auto scroll-panel">

				<!-- ═══ SECTION 1: Schedule focus (only when active) ═══ -->
				<div v-if="hasActiveSchedule" class="mb-5">
					<div class="depth-panel border border-border-visible rounded-lg p-4">
						<!-- Header row: status + actions -->
						<div class="flex flex-wrap items-center gap-2 mb-3">
							<div class="flex items-center gap-2 flex-1 min-w-0">
								<Radio
									:size="14"
									:class="taskProgress?.overrun ? 'text-app-danger' : isPaused ? 'text-app-warning' : 'text-app-success'"
									class="shrink-0"
								/>
								<span class="font-rajdhani font-bold text-xs uppercase tracking-widest"
									:class="taskProgress?.overrun ? 'text-app-danger' : isPaused ? 'text-app-warning' : 'text-app-success'"
								>
									{{ taskProgress?.overrun ? 'Behind' : isPaused ? 'Paused' : 'In Progress' }}
								</span>
							</div>
							<div class="flex items-center gap-2 shrink-0">
								<button
									@click="togglePause()"
									class="btn-themed flex items-center gap-1 px-2.5 py-1 text-xs font-rajdhani font-semibold transition-all"
									:class="isPaused
										? 'bg-app-success text-text-inverse hover:brightness-110'
										: 'bg-surface-hover border border-border-visible text-text-secondary hover:border-accent-dim'"
								>
									<Play v-if="isPaused" :size="12" />
									<Pause v-else :size="12" />
									{{ isPaused ? 'Resume' : 'Pause' }}
								</button>
								<router-link
									:to="{ name: 'schedule' }"
									class="btn-themed flex items-center gap-1 px-2.5 py-1 text-xs font-rajdhani font-semibold bg-surface-hover border border-border-visible text-text-secondary hover:border-accent-dim transition-all"
								>
									<ArrowRight :size="12" />
									Schedule
								</router-link>
							</div>
						</div>

						<!-- Current task -->
						<div v-if="currentScheduleTask">
							<task-card
								:task="store.getPrioritisedTasks.find(t => t.id === currentScheduleTask.id)"
								@openDetail="openTaskDetail"
								class="!mt-0"
							/>

							<!-- Progress bar -->
							<div v-if="taskProgress && !isPaused" class="mt-3">
								<div class="flex items-center justify-between mb-1">
									<span class="font-rajdhani text-[10px] text-text-secondary">
										{{ taskProgress.elapsedLabel }} elapsed
									</span>
									<span class="font-rajdhani text-[10px] font-semibold"
										:class="taskProgress.overrun ? 'text-app-danger' : 'text-text-secondary'"
									>
										{{ taskProgress.overrun
											? `${taskProgress.overrunLabel} over`
											: `${taskProgress.remainingLabel} left` }}
									</span>
								</div>
								<div class="h-1.5 rounded-full bg-surface-base overflow-hidden">
									<div
										class="h-full rounded-full progress-bar-live"
										:class="taskProgress.overrun ? 'bg-app-danger' : 'bg-accent'"
										:style="{ width: Math.min(taskProgress.percent, 100) + '%' }"
									></div>
								</div>
							</div>
						</div>
						<div v-else class="font-rajdhani text-sm text-text-secondary">
							All tasks completed
						</div>

						<!-- Up next preview -->
						<div v-if="upNextScheduleItem" class="mt-3 pt-3 border-t border-border-default">
							<div class="flex items-center gap-2 text-left">
								<ChevronRight :size="12" class="text-text-secondary shrink-0" />
								<span class="font-rajdhani text-xs text-text-secondary shrink-0">Up next</span>
								<span class="font-rajdhani text-xs text-text-heading font-semibold truncate flex-1">
									{{ upNextScheduleItem.isBreak ? 'Break' : upNextScheduleItem.name }}
								</span>
								<span v-if="upNextScheduleItem.time" class="font-rajdhani text-[10px] text-text-secondary shrink-0">
									{{ upNextScheduleItem.time }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- ═══ SECTION 2: Quick stats (always visible) ═══ -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
					<router-link :to="{ name: 'tasks', query: { tab: 'backlog' } }" class="depth-panel border border-border-visible rounded-lg px-3 py-2.5 flex items-center gap-2 stat-counter-link">
						<ListTodo :size="14" class="text-accent shrink-0" />
						<div class="min-w-0">
							<p class="font-rajdhani text-xs text-text-secondary mb-0 text-left">Backlog</p>
							<p class="font-rajdhani text-sm text-text-heading font-semibold mb-0 text-left">
								{{ activeTaskCount }} task{{ activeTaskCount === 1 ? '' : 's' }}
							</p>
						</div>
					</router-link>
					<router-link :to="{ name: 'tasks', query: { tab: 'completed' } }" class="depth-panel border border-border-visible rounded-lg px-3 py-2.5 flex items-center gap-2 stat-counter-link">
						<CheckCircle2 :size="14" class="text-app-success shrink-0" />
						<div class="min-w-0">
							<p class="font-rajdhani text-xs text-text-secondary mb-0 text-left">This week</p>
							<p class="font-rajdhani text-sm text-text-heading font-semibold mb-0 text-left">
								{{ completedLast7Days }} completed
							</p>
						</div>
					</router-link>
					<div v-if="nearestDeadline" class="depth-panel border border-border-visible rounded-lg px-3 py-2.5 flex items-center gap-2">
						<AlertCircle :size="14" class="text-app-warning shrink-0" />
						<div class="min-w-0">
							<p class="font-rajdhani text-xs text-text-secondary mb-0 text-left">Deadline</p>
							<p class="font-rajdhani text-sm text-text-heading font-semibold mb-0 truncate text-left">
								{{ nearestDeadline.task.name }}
								<span class="text-text-secondary font-normal">
									{{ nearestDeadline.daysAway === 0 ? 'today' : nearestDeadline.daysAway === 1 ? 'tomorrow' : `in ${nearestDeadline.daysAway}d` }}
								</span>
							</p>
						</div>
					</div>
					<router-link v-else :to="{ name: 'schedule' }" class="depth-panel border border-border-visible rounded-lg px-3 py-2.5 flex items-center gap-2 stat-counter-link">
						<Radio :size="14" :class="scheduleStatus.active ? 'text-app-success' : 'text-text-secondary'" class="shrink-0" />
						<div class="min-w-0">
							<p class="font-rajdhani text-xs text-text-secondary mb-0 text-left">Schedule</p>
							<p class="font-rajdhani text-sm text-text-heading font-semibold mb-0 text-left">
								{{ scheduleStatus.label }}
							</p>
						</div>
					</router-link>
				</div>

				<!-- ═══ SECTION 3: Alerts (activity + blocked) ═══ -->
				<div v-if="store.activityFeed.length > 0 || actionableBlockedTasks.length > 0" class="mb-5">
					<!-- Activity feed -->
					<div v-if="store.activityFeed.length > 0" :class="actionableBlockedTasks.length > 0 ? 'mb-4' : ''">
						<h5 class="text-left mb-2 font-bold font-rajdhani text-xs text-text-heading uppercase tracking-widest flex items-center gap-1.5">
							<Bell :size="12" class="text-accent" />
							Activity
							<span v-if="unseenActivityCount > 0" class="bg-accent text-text-inverse text-[10px] font-rajdhani font-bold rounded-full w-5 h-5 inline-flex items-center justify-center leading-none">
								{{ unseenActivityCount }}
							</span>
						</h5>
						<div class="space-y-1">
							<div
								v-for="activity in store.activityFeed.slice(0, 5)"
								:key="activity.id"
								class="rounded-md px-3 py-2 border border-border-visible text-left"
								:class="activity.seen
									? 'bg-surface-base'
									: 'bg-surface-hover'"
							>
								<div class="flex items-start gap-2.5">
									<div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
										:class="activity.icon === 'unblock' ? 'bg-app-success/20 text-app-success' : activity.icon === 'repeat' ? 'bg-accent/20 text-accent' : activity.icon === 'archive' ? 'bg-text-secondary/20 text-text-secondary' : 'bg-accent/20 text-accent'"
									>
										<CheckCircle2 v-if="activity.icon === 'unblock'" :size="10" />
										<Repeat v-else-if="activity.icon === 'repeat'" :size="10" />
										<Archive v-else-if="activity.icon === 'archive'" :size="10" />
										<Bell v-else :size="10" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="font-rajdhani text-sm font-semibold mb-0 text-left"
											:class="activity.seen ? 'text-text-heading' : 'text-white'"
										>{{ activity.text }}</p>
										<p class="font-rajdhani text-[10px] text-text-secondary mb-0 text-left">{{ formatActivityTime(activity.timestamp) }}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Blocked tasks — only manually blocked (needs user action) -->
					<div v-if="actionableBlockedTasks.length > 0">
						<h5 class="text-left mb-2 font-bold font-rajdhani text-xs text-app-warning uppercase tracking-widest flex items-center gap-1.5">
							<Ban :size="12" />
							Needs attention
							<span class="text-[10px] font-rajdhani font-bold bg-app-warning/15 text-app-warning rounded-full w-5 h-5 inline-flex items-center justify-center leading-none">
								{{ actionableBlockedTasks.length }}
							</span>
						</h5>
						<div class="space-y-1">
							<task-card
								v-for="task in actionableBlockedTasks.slice(0, 3)"
								:key="`blocked-${task.id}`"
								:task="task"
								@openDetail="openTaskDetail"
								class="!mt-0"
							/>
							<router-link
								v-if="actionableBlockedTasks.length > 3"
								:to="{ name: 'tasks', query: { tab: 'backlog', status: 'blocked' } }"
								class="block text-[10px] font-rajdhani text-text-secondary hover:text-accent transition-colors pl-3 pt-1"
							>
								+{{ actionableBlockedTasks.length - 3 }} more &middot; View all blocked
							</router-link>
						</div>
					</div>
				</div>

				<!-- ═══ SECTION 4: Spotlights (no schedule only) ═══ -->
				<div v-if="!hasActiveSchedule" class="md:grid md:grid-cols-2 md:gap-4 mb-5 space-y-4 md:space-y-0">
					<div v-if="highestPriorityTask.length">
						<div class="spotlight-label flex items-center gap-2 mb-2 pl-3">
							<Crosshair :size="12" class="text-accent" />
							<span class="font-bold font-rajdhani text-xs text-accent uppercase tracking-widest">
								Recommended
							</span>
						</div>
						<task-card
							:task="highestPriorityTask[0]"
							@openDetail="openTaskDetail"
							class="!mt-0"
						/>
					</div>

					<div v-if="oldestTask.length">
						<div class="spotlight-label flex items-center gap-2 mb-2 pl-3">
							<Clock :size="12" class="text-app-warning" />
							<span class="font-bold font-rajdhani text-xs text-app-warning uppercase tracking-widest">
								Oldest Task
							</span>
						</div>
						<task-card
							:task="oldestTask[0]"
							@openDetail="openTaskDetail"
							class="!mt-0"
						/>
					</div>
				</div>

				<!-- ═══ SECTION 5: Insights ═══ -->
				<!-- Estimation accuracy -->
				<div v-if="estimationAccuracy" class="mb-5 overflow-hidden rounded-lg border border-border-visible">
					<div
						class="depth-panel hover-glow cursor-pointer"
						@click="recentMisses.length > 0 && (showMisses = !showMisses)"
					>
						<div class="flex items-stretch">
							<div class="flex items-center justify-center px-6 py-5" :class="estimationAccuracy.bgClass">
								<span class="text-3xl font-rajdhani font-bold text-white leading-none">{{ estimationAccuracy.percentage }}%</span>
							</div>
							<div class="flex-1 px-5 py-4 text-left">
								<div class="flex items-center gap-2 mb-1">
									<h5 class="font-bold font-rajdhani text-xs uppercase tracking-widest">Estimation Accuracy</h5>
									<span class="text-xs text-text-secondary font-rajdhani">{{ estimationAccuracy.taskCount }} task{{ estimationAccuracy.taskCount === 1 ? '' : 's' }}</span>
									<ChevronDown
										v-if="recentMisses.length > 0"
										:size="12"
										class="text-text-secondary transition-transform duration-200 ml-auto"
										:class="showMisses ? 'rotate-180' : ''"
									/>
								</div>
								<p class="text-sm text-text-secondary font-rajdhani mt-1 mb-0">
									{{ estimationAccuracy.summary }}
								</p>
								<p v-if="estimationAccuracy.direction" class="text-xs text-text-secondary font-rajdhani mt-1 mb-0 opacity-80">
									{{ estimationAccuracy.direction }}
								</p>
							</div>
						</div>
					</div>
					<!-- Recent misses -->
					<div v-if="showMisses && recentMisses.length > 0" class="border-t border-border-default">
						<div class="px-4 py-2.5">
							<p class="font-rajdhani text-[10px] text-text-secondary uppercase tracking-widest mb-2">Recent misses</p>
							<div
								v-for="(miss, i) in recentMisses"
								:key="i"
								class="flex items-center gap-3 py-1.5"
								:class="i < recentMisses.length - 1 ? 'border-b border-border-default' : ''"
							>
								<span class="font-rajdhani text-sm text-text-heading font-semibold flex-1 min-w-0 truncate text-left">
									{{ miss.name }}
								</span>
								<span class="font-rajdhani text-xs shrink-0 flex items-center gap-1">
									<span class="text-text-secondary line-through">{{ miss.estimated }}</span>
									<span class="text-text-secondary">&rarr;</span>
									<span :class="miss.wasUnder ? 'text-app-danger' : 'text-app-success'" class="font-semibold">
										{{ miss.actual }}
									</span>
									<span class="text-text-secondary text-[10px]">({{ miss.actualMins }}m)</span>
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Breakdowns — side by side on desktop -->
				<div ref="breakdownRef" class="md:grid md:grid-cols-2 md:gap-4">
					<!-- Priority Breakdown -->
					<div class="mb-5 md:mb-0">
						<h5 class="text-start mb-3 font-bold font-rajdhani text-xs text-text-heading uppercase tracking-widest">
							By Priority
						</h5>
						<div class="depth-panel depth-highlight rounded-lg border border-border-visible p-4">
							<!-- Stacked bar -->
							<div class="flex h-7 rounded-sm overflow-hidden border border-border-visible/50">
								<router-link
									v-for="item in priorityBreakdown"
									:key="item.label"
									:to="{ name: 'tasks', query: { tab: 'backlog', priority: item.value } }"
									v-show="item.count > 0"
									class="priority-segment h-full transition-all duration-500"
									:style="{ width: item.percent + '%', backgroundColor: item.color }"
									:title="item.label + ': ' + item.count"
								/>
							</div>
							<!-- Legend -->
							<div class="flex flex-wrap gap-x-4 gap-y-1 mt-3">
								<router-link
									v-for="item in priorityBreakdown"
									:key="'legend-' + item.label"
									:to="{ name: 'tasks', query: { tab: 'backlog', priority: item.value } }"
									class="flex items-center gap-1.5 group"
								>
									<span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
									<span class="text-xs font-rajdhani font-semibold text-text-secondary group-hover:text-text-heading transition-colors">
										{{ item.label }}
									</span>
									<span class="text-xs font-rajdhani font-bold text-text-heading">{{ item.count }}</span>
								</router-link>
							</div>
						</div>
					</div>

					<!-- Category Breakdown -->
					<div>
						<h5 class="text-start mb-3 font-bold font-rajdhani text-xs text-text-heading uppercase tracking-widest">
							By Category
						</h5>
						<div class="depth-panel depth-highlight rounded-lg border border-border-visible p-4">
							<div v-if="categoryBreakdown.length === 0" class="py-4 text-center text-text-secondary font-rajdhani text-sm">
								No categories yet
							</div>
							<template v-else>
								<!-- Stacked bar -->
								<div class="flex h-7 rounded-sm overflow-hidden border border-border-visible/50">
									<router-link
										v-for="item in categoryBreakdown"
										:key="item.label"
										:to="{ name: 'tasks', query: { tab: 'backlog', category: item.label } }"
										v-show="item.count > 0"
										class="priority-segment h-full transition-all duration-500"
										:style="{ width: item.percent + '%', backgroundColor: item.color }"
										:title="item.label + ': ' + item.count"
									/>
								</div>
								<!-- Legend -->
								<div class="flex flex-wrap gap-x-4 gap-y-1 mt-3">
									<router-link
										v-for="item in categoryBreakdown"
										:key="'legend-' + item.label"
										:to="{ name: 'tasks', query: { tab: 'backlog', category: item.label } }"
										class="flex items-center gap-1.5 group"
									>
										<span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
										<span class="text-xs font-rajdhani font-semibold text-text-secondary group-hover:text-text-heading transition-colors">
											{{ item.label }}
										</span>
										<span class="text-xs font-rajdhani font-bold text-text-heading">{{ item.count }}</span>
									</router-link>
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
		</content-card>
		<TaskDetailModal ref="taskDetailRef" />
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import ContentCard from '@/components/ContentCard.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { ListTodo, CheckCircle2, FolderOpen, Radio, Crosshair, Clock, Pause, Play, AlertCircle, ArrowRight, Ban, Bell, Repeat, Archive, ChevronRight, ChevronDown } from 'lucide-vue-next'

export default {
	name: 'DashboardView',

	components: {
		ContentCard,
		TaskCard,
		TaskDetailModal,
		SkeletonLoader,
		ListTodo,
		CheckCircle2,
		FolderOpen,
		Radio,
		Crosshair,
		Clock,
		Pause,
		Play,
		AlertCircle,
		ArrowRight,
		Ban,
		Bell,
		Repeat,
		Archive,
		ChevronRight,
		ChevronDown
	},

	setup() {
		const store = useAppStore()
		const { pageCheck, getActualBand, saveScheduleToDatabase, getScheduleTimes, recalculateRemainingTime, findTaskToSuggest, markActivitiesSeen, purgeOldActivities, checkPrerequisiteDateUnblocks } = useTaskActions()
		return { store, pageCheck, getActualBand, saveScheduleToDatabase, getScheduleTimes, recalculateRemainingTime, findTaskToSuggest, markActivitiesSeen, purgeOldActivities, checkPrerequisiteDateUnblocks }
	},

	data() {
		return {
			progressTick: 0,
			progressTimer: null,
			showMisses: false
		}
	},

	created() {
		this.pageCheck()
	},

	mounted() {
		// Check for prerequisite date unblocks, mark activities seen, purge old ones
		this.$nextTick(() => {
			this.checkPrerequisiteDateUnblocks()

			if (this.store.activityFeed.length > 0) {
				this.markActivitiesSeen()
				this.purgeOldActivities()
			}
		})

		// Tick every 30s to keep progress bar live
		this.progressTimer = setInterval(() => {
			this.progressTick++
		}, 30000)
	},

	beforeUnmount() {
		if (this.progressTimer) {
			clearInterval(this.progressTimer)
			this.progressTimer = null
		}
	},

	computed: {
		isLoading() {
			return this.store.isLoadingTasks
		},

		hasTasks() {
			return this.store.getPrioritisedTasks.length > 0
		},

		activeTaskCount() {
			return this.store.getPrioritisedTasks.length
		},

		completedLast7Days() {
			const sevenDaysAgo = new Date()
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
			sevenDaysAgo.setHours(0, 0, 0, 0)
			return this.store.completed.filter(t => {
				if (!t.completedDateTime) return false
				return new Date(t.completedDateTime) >= sevenDaysAgo
			}).length
		},

		categoryCount() {
			return this.store.getCategories.length
		},

		scheduleStatus() {
			if (this.store.schedule && this.store.schedule.tasks) {
				if (this.store.schedule.paused) return { label: 'Paused', active: false }
				return { label: 'Active', active: true }
			}
			return { label: 'None', active: false }
		},

		hasActiveSchedule() {
			return !!(this.store.schedule && this.store.schedule.tasks)
		},

		isPaused() {
			return !!this.store.schedule?.paused
		},

		currentScheduleTask() {
			if (!this.store.schedule?.tasks) return null
			const taskType = this.store.taskType
			const prioritised = this.store.getPrioritisedTasks
			// Current task = first non-completed user task in schedule
			return this.store.schedule.tasks.find(t => {
				const isUserTask = t.type == null || t.type === taskType.userTask
				return isUserTask && !t.completed && prioritised.find(x => x.id === t.id)
			}) || null
		},

		taskProgress() {
			if (!this.currentScheduleTask || !this.store.schedule?.tasks) return null
			// eslint-disable-next-line no-unused-vars
			const _tick = this.progressTick // reactive dependency for live updates
			const schedule = this.store.schedule
			const settings = this.store.getAccountSettings?.taskLength

			// Walk the schedule to find the current task's start and end times
			// Mirror TaskSchedule.scheduleDetails logic: skip completed tasks,
			// use actualStartTime on first remaining task to reset the clock
			const startDateTime = new Date(schedule.start)
			let taskTime = new Date(startDateTime)
			let taskStart = null
			let taskEnd = null
			let usedActualStart = false
			const prioritised = this.store.getPrioritisedTasks
			const taskType = this.store.taskType

			for (const t of schedule.tasks) {
				const isUserTask = t.type == null || t.type === taskType.userTask
				const isCompleted = isUserTask && (t.completed || !prioritised.find(x => x.id === t.id))

				if (isCompleted && t.completedTime) {
					// Skip completed tasks — don't advance taskTime
					continue
				}

				// Use actualStartTime on first remaining task
				if (!usedActualStart && t.actualStartTime) {
					taskTime = new Date(t.actualStartTime)
					usedActualStart = true
				}

				const sizingMins = settings?.[t.sizing] ?? t.sizing ?? 0
				const endTime = new Date(taskTime.getTime() + sizingMins * 60000)

				if (t.id === this.currentScheduleTask.id) {
					taskStart = taskTime
					taskEnd = endTime
					break
				}
				taskTime = endTime
			}

			if (!taskStart || !taskEnd || isNaN(taskStart) || isNaN(taskEnd)) return null

			const now = new Date()
			const totalMs = taskEnd - taskStart
			const elapsedMs = now - taskStart
			const remainingMs = taskEnd - now
			const overrun = remainingMs <= 0
			const percent = totalMs > 0 ? Math.round((elapsedMs / totalMs) * 100) : 0

			const formatDuration = (ms) => {
				const absMins = Math.ceil(Math.abs(ms) / 60000)
				if (absMins >= 60) {
					const h = Math.floor(absMins / 60)
					const m = absMins % 60
					return m > 0 ? `${h}h ${m}m` : `${h}h`
				}
				return `${absMins}m`
			}

			return {
				percent,
				overrun,
				elapsedLabel: formatDuration(elapsedMs),
				remainingLabel: !overrun ? formatDuration(remainingMs) : null,
				overrunLabel: overrun ? formatDuration(Math.abs(remainingMs)) : null
			}
		},

		upNextScheduleItem() {
			if (!this.currentScheduleTask || !this.store.schedule?.tasks) return null
			const tasks = this.store.schedule.tasks
			const taskType = this.store.taskType
			const prioritised = this.store.getPrioritisedTasks
			const currentIdx = tasks.findIndex(t => t.id === this.currentScheduleTask.id)
			if (currentIdx < 0 || currentIdx >= tasks.length - 1) return null

			const next = tasks[currentIdx + 1]
			const isBreak = next.type === taskType.systemBreak

			// Calculate the time for the next item — skip completed, use actualStartTime
			const settings = this.store.getAccountSettings?.taskLength
			const startDateTime = new Date(this.store.schedule.start)
			let taskTime = new Date(startDateTime)
			let usedActualStart = false
			for (let i = 0; i <= currentIdx; i++) {
				const t = tasks[i]
				const isUserTask = t.type == null || t.type === taskType.userTask
				const isCompleted = isUserTask && (t.completed || !prioritised.find(x => x.id === t.id))
				if (isCompleted && t.completedTime) continue
				if (!usedActualStart && t.actualStartTime) {
					taskTime = new Date(t.actualStartTime)
					usedActualStart = true
				}
				const sizingMins = settings?.[t.sizing] ?? t.sizing ?? 0
				taskTime = new Date(taskTime.getTime() + sizingMins * 60000)
			}

			return {
				name: isBreak ? 'Break' : next.name,
				isBreak,
				time: taskTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
			}
		},

		nearestDeadline() {
			const now = new Date()
			const tasks = this.store.getPrioritisedTasks.filter(t => t.targetDateTime)
			if (tasks.length === 0) return null

			let nearest = null
			let nearestDays = Infinity
			for (const t of tasks) {
				const deadline = new Date(t.targetDateTime)
				const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
				if (diffDays >= 0 && diffDays < nearestDays) {
					nearestDays = diffDays
					nearest = { task: t, daysAway: diffDays }
				}
			}
			return nearest
		},

		unseenActivityCount() {
			return this.store.activityFeed.filter(a => !a.seen).length
		},

		blockedTasks() {
			const depBlockedIds = this.store.getDependencyBlockedIds
			const now = new Date()
			return this.store.getPrioritisedTasks.filter(t => {
				if (t.blocked) return true
				if (depBlockedIds.has(t.id)) return true
				if (t.prerequisiteDate && new Date(t.prerequisiteDate) > now) return true
				return false
			})
		},

		actionableBlockedTasks() {
			// Only tasks that are manually blocked — these won't auto-unblock
			// and need the user to take action to resolve them
			return this.store.getPrioritisedTasks.filter(t => t.blocked)
		},

		highestPriorityTask() {
			const tasks = this.store.getPrioritisedTasks
			return tasks.length > 0 ? [tasks[0]] : []
		},

		oldestTask() {
			const tasks = this.store.getTasksInCreatedOrder
			return tasks.length > 0 ? [tasks[0]] : []
		},

		getPrioritisedTasks() {
			return this.store.getPrioritisedTasks
		},

		estimationAccuracy() {
			const tracked = this.store.completed.filter(
				t => t.actualDuration != null && t.sizing != null && t.sizing > 0
			)
			if (tracked.length === 0) return null

			const defaultBands = this.store.getAccountSettings.taskLength

			let correctCount = 0
			let underCount = 0
			let overCount = 0
			for (const task of tracked) {
				const bands = task.estimateBandsAtCompletion ?? defaultBands
				const actualBand = this.getActualBand(task.actualDuration, bands)
				if (actualBand === task.sizing) {
					correctCount++
				} else if (actualBand > task.sizing) {
					underCount++ // actual band is larger — task took longer than estimated
				} else {
					overCount++ // actual band is smaller — task was quicker than estimated
				}
			}

			const percentage = Math.round((correctCount / tracked.length) * 100)

			let summary, bgClass
			if (percentage >= 70) {
				summary = `${correctCount} of ${tracked.length} tasks landed in the right size band — nice work`
				bgClass = 'bg-app-success'
			} else if (percentage >= 40) {
				summary = `Only ${correctCount} of ${tracked.length} tasks matched their size band — review your sizing`
				bgClass = 'bg-app-warning'
			} else {
				summary = `${correctCount} of ${tracked.length} tasks matched their size band — consider adjusting estimates`
				bgClass = 'bg-app-danger'
			}

			// Direction indicator based on band comparison
			let direction = null
			const wrongCount = underCount + overCount
			if (wrongCount > 0) {
				if (underCount > overCount) {
					direction = 'You tend to under-estimate — tasks often take longer than expected'
				} else if (overCount > underCount) {
					direction = 'You tend to over-estimate — you\'re more productive than you think'
				} else {
					direction = 'Your misses are balanced between over and under-estimates'
				}
			}

			return { percentage, taskCount: tracked.length, summary, bgClass, direction }
		},

		recentMisses() {
			const defaultBands = this.store.getAccountSettings.taskLength
			const tracked = this.store.completed.filter(
				t => t.actualDuration != null && t.sizing != null && t.sizing > 0
			)

			// Sort by completion date descending, take misses only
			const sorted = [...tracked].sort((a, b) =>
				new Date(b.completedDateTime) - new Date(a.completedDateTime)
			)

			const misses = []
			for (const task of sorted) {
				if (misses.length >= 5) break
				const bands = task.estimateBandsAtCompletion ?? defaultBands
				const actualBand = this.getActualBand(task.actualDuration, bands)
				if (actualBand !== task.sizing) {
					misses.push({
						name: task.name,
						estimated: this.store.getSizeLabel(task.sizing),
						actual: this.store.getSizeLabel(actualBand),
						actualMins: task.actualDuration,
						wasUnder: actualBand > task.sizing // took longer than estimated
					})
				}
			}
			return misses
		},

		categoryBreakdown() {
			const categories = this.store.getCategories
			const tasks = this.getPrioritisedTasks
			const palette = this.store.categoryPalette
			const total = tasks.length || 1

			return categories.map((category, index) => {
				const count = tasks.filter(x => x.category === category).length
				return {
					label: category,
					count,
					percent: Math.round((count / total) * 100),
					color: palette[index % palette.length]
				}
			}).sort((a, b) => b.count - a.count)
		},

		priorityBreakdown() {
			const tasks = this.getPrioritisedTasks
			const total = tasks.length || 1

			return this.store.getPriorityNames.map(name => {
				const priority = this.store.priorities[name]
				const count = tasks.filter(x => x.priority === priority.value).length
				return {
					label: name.charAt(0).toUpperCase() + name.slice(1),
					value: priority.value,
					count,
					percent: Math.round((count / total) * 100),
					color: priority.color
				}
			})
		}
	},

	methods: {
		openTaskDetail(task) {
			this.$refs.taskDetailRef.show(task)
		},

		scrollToBreakdown() {
			this.$refs.breakdownRef?.scrollIntoView({ behavior: 'smooth', block: 'start' })
		},

		formatActivityTime(timestamp) {
			const date = new Date(timestamp)
			const now = new Date()
			const diffMs = now - date
			const diffMins = Math.floor(diffMs / 60000)
			if (diffMins < 1) return 'Just now'
			if (diffMins < 60) return `${diffMins}m ago`
			const diffHours = Math.floor(diffMins / 60)
			if (diffHours < 24) return `${diffHours}h ago`
			return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
		},

		togglePause() {
			if (!this.hasActiveSchedule) return
			const schedule = this.store.schedule

			if (this.isPaused) {
				// Resume: update start time to now, clear pause
				const updated = JSON.parse(JSON.stringify(schedule))
				updated.paused = false
				updated.pausedAt = null
				this.saveScheduleToDatabase(updated)
			} else {
				// Pause: store paused state
				const updated = JSON.parse(JSON.stringify(schedule))
				updated.paused = true
				updated.pausedAt = new Date().toISOString()
				this.saveScheduleToDatabase(updated)
			}
		}
	}
}
</script>

<style scoped>
.stat-counter-link {
	text-decoration: none;
	cursor: pointer;
}

.breakdown-row {
	text-decoration: none;
}

.breakdown-row:hover .bar-glow {
	box-shadow: 0 0 8px currentColor;
	filter: brightness(1.2);
}

.bar-glow {
	transition: width 0.5s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.priority-segment {
	text-decoration: none;
	min-width: 4px;
}

.priority-segment:hover {
	filter: brightness(1.2);
	box-shadow: inset 0 0 0 100px rgba(255, 255, 255, 0.1);
}

</style>
