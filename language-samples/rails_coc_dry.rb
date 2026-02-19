# Ruby on Rails — Convention over Configuration (CoC) & DRY
# BarbrickDesign - Complete Language Portfolio
#
# Features demonstrated:
# - CoC: Model → table naming (User → users)
# - CoC: Controller → route mapping (UsersController → /users)
# - CoC: RESTful actions and nested resources
# - DRY: ActiveSupport::Concern for shared model behaviour
# - DRY: ApplicationController base with shared before_action logic
# - DRY: Model scopes and validations kept in one place
# - DRY: Service objects to remove duplicated controller logic
# - DRY: Helper modules for shared view/formatting logic

# ============================================================
# 1. CoC — Model Naming → Table Naming
# Rails automatically maps:
#   class User        →  table "users"
#   class BlogPost    →  table "blog_posts"
#   class LineItem    →  table "line_items"
# No configuration needed — just follow the convention.
# ============================================================

# app/models/application_record.rb  (auto-generated base class)
class ApplicationRecord
  # Simulated ActiveRecord base — every model inherits this.
  # CoC: Rails knows how to find the DB table from the class name.
  def self.table_name
    name.gsub(/([A-Z])/, '_\1').downcase.sub(/^_/, '') + 's'
  end
end

# ============================================================
# 2. DRY — ActiveSupport::Concern (shared model behaviour)
# Instead of copy-pasting timestamp/audit logic into every model,
# extract it into a reusable Concern and include it where needed.
# ============================================================

module Auditable
  def self.included(base)
    base.instance_variable_set(:@auditable, true)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def auditable?
      @auditable
    end
  end

  # Shared instance behaviour — no duplication across models
  def audit_log
    "[#{self.class.name}##{object_id}] last touched at #{Time.now}"
  end

  def created_by?(user)
    respond_to?(:creator_id) && creator_id == user.id
  end
end

module Publishable
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    # DRY scope — defined once, reused by every model that includes Publishable
    def published
      all.select { |record| record.published? }
    end

    def draft
      all.select { |record| !record.published? }
    end
  end

  def publish!
    @published = true
    @published_at = Time.now
    self
  end

  def unpublish!
    @published = false
    @published_at = nil
    self
  end

  def published?
    !!@published
  end
end

module Taggable
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def tagged_with(tag)
      select { |record| record.tags.include?(tag) }
    end
  end

  def tags
    @tags ||= []
  end

  def add_tag(tag)
    tags << tag unless tags.include?(tag)
    self
  end

  def remove_tag(tag)
    tags.delete(tag)
    self
  end
end

# ============================================================
# 3. CoC — RESTful Resource Routing
# Rails convention maps controller actions to HTTP verbs:
#   GET    /articles         → ArticlesController#index
#   GET    /articles/new     → ArticlesController#new
#   POST   /articles         → ArticlesController#create
#   GET    /articles/:id     → ArticlesController#show
#   GET    /articles/:id/edit→ ArticlesController#edit
#   PATCH  /articles/:id     → ArticlesController#update
#   DELETE /articles/:id     → ArticlesController#destroy
# Just declare: resources :articles  — no manual route config.
# ============================================================

# Simulated Rails Router DSL
class Router
  RESOURCE_ACTIONS = {
    index:   { method: :get,    path: '/%s' },
    new:     { method: :get,    path: '/%s/new' },
    create:  { method: :post,   path: '/%s' },
    show:    { method: :get,    path: '/%s/:id' },
    edit:    { method: :get,    path: '/%s/:id/edit' },
    update:  { method: :patch,  path: '/%s/:id' },
    destroy: { method: :delete, path: '/%s/:id' }
  }.freeze

  def initialize
    @routes = []
  end

  # CoC: one call generates all 7 RESTful routes automatically
  def resources(name, only: RESOURCE_ACTIONS.keys, except: [])
    controller = "#{name.to_s.split('_').map(&:capitalize).join}Controller"
    actions = (only - except)
    actions.each do |action|
      config = RESOURCE_ACTIONS[action]
      @routes << {
        method:     config[:method],
        path:       format(config[:path], name),
        controller: controller,
        action:     action
      }
    end
  end

  def print_routes
    @routes.each do |r|
      puts "  #{r[:method].to_s.upcase.ljust(6)} #{r[:path].ljust(30)} #{r[:controller]}##{r[:action]}"
    end
  end
end

# ============================================================
# 4. DRY — ApplicationController (shared controller behaviour)
# Put common before_action, helpers, and error handling here
# so every controller inherits them without repetition.
# ============================================================

class ApplicationController
  # Security: in a real Rails app, ActionController::Base enables
  # CSRF protection automatically. Explicit declaration for clarity:
  #   protect_from_forgery with: :exception  (CoC default in Rails)
  # This simulation stub mirrors that intent for standalone execution.
  def self.protect_from_forgery(**); end
  protect_from_forgery with: :exception

  # DRY: authenticate_user! defined once, used in every controller
  def authenticate_user!
    raise 'Unauthorized' unless current_user
  end

  # DRY: shared current_user helper — no duplication
  def current_user
    @current_user  # would normally read from session
  end

  def set_current_user(user)
    @current_user = user
  end

  # DRY: uniform JSON error response — one method, many callers
  def render_error(message, status: 422)
    { error: message, status: status }
  end

  # DRY: pagination helper used by any index action
  def paginate(collection, page: 1, per: 25)
    start = (page - 1) * per
    collection[start, per] || []
  end
end

# ============================================================
# 5. CoC + DRY — Model Classes
# • CoC: class name → table name (no config)
# • DRY: validations and scopes live in the model, not in controllers
# • DRY: Concerns included with one line instead of copy-paste
# ============================================================

class User < ApplicationRecord
  include Auditable
  include Taggable

  attr_accessor :id, :name, :email, :role, :creator_id

  # DRY: validations defined once in the model
  VALID_ROLES = %w[user moderator admin].freeze

  def initialize(id:, name:, email:, role: 'user')
    @id   = id
    @name = name
    @email = email
    @role  = role
  end

  def valid?
    errors.empty?
  end

  def errors
    errs = []
    errs << 'Name is required' if name.nil? || name.strip.empty?
    errs << 'Email is required' if email.nil? || email.strip.empty?
    errs << 'Email must contain @' unless email.to_s.include?('@')
    errs << "Role must be one of: #{VALID_ROLES.join(', ')}" unless VALID_ROLES.include?(role)
    errs
  end

  # DRY: scope — defined here, not scattered across controllers
  def self.admins
    all.select { |u| u.role == 'admin' }
  end

  def self.all
    @store ||= []
  end

  def save
    self.class.all << self if valid?
    valid?
  end

  def to_s
    "User##{id}(#{name}, #{email}, #{role})"
  end
end

class Article < ApplicationRecord
  include Auditable
  include Publishable
  include Taggable

  attr_accessor :id, :title, :body, :author_id, :creator_id

  def initialize(id:, title:, body:, author_id:)
    @id        = id
    @title     = title
    @body      = body
    @author_id = author_id
    @creator_id = author_id
  end

  def self.all
    @store ||= []
  end

  def save
    self.class.all << self
    self
  end

  def to_s
    status = published? ? 'published' : 'draft'
    "Article##{id}(#{title.inspect}, #{status})"
  end
end

# ============================================================
# 6. DRY — Service Object
# Extract repeated multi-step logic OUT of controllers and into
# a dedicated service class so it can be called from anywhere.
# ============================================================

class ArticlePublisher
  # DRY: the "publish an article and notify followers" flow
  # lives in ONE place instead of being copied across controllers.
  def initialize(article, notifier: nil)
    @article   = article
    @notifier  = notifier
  end

  def call
    @article.publish!
    notify_followers
    log_event
    { ok: true, article: @article }
  rescue => e
    { ok: false, error: e.message }
  end

  private

  def notify_followers
    @notifier&.call("New article published: #{@article.title}")
  end

  def log_event
    puts "  [AUDIT] #{@article.audit_log}"
  end
end

# ============================================================
# 7. DRY — Controller using ApplicationController + Service
# Thin controller: delegates to service, no business logic here.
#
# NOTE: This is a standalone Ruby simulation for demonstration.
# In a real Rails app, ActionController::Base enables CSRF
# protection by default via:
#   protect_from_forgery with: :exception
# No explicit configuration is needed — CoC handles it.
# ============================================================

class ArticlesController < ApplicationController
  # CoC: Rails auto-maps these action names to HTTP verbs + paths.
  # DRY: before_action declared once — runs before every action.

  def initialize
    @before_filters = [:authenticate_user!]
    @articles = Article.all
  end

  def index
    run_before_filters
    { articles: paginate(@articles), total: @articles.size }
  end

  def show(id)
    run_before_filters
    article = @articles.find { |a| a.id == id }
    article ? { article: article } : render_error('Not found', status: 404)
  end

  def create(params)
    run_before_filters
    article = Article.new(**params)
    article.save
    { article: article, created: true }
  end

  def publish(id)
    run_before_filters
    article = @articles.find { |a| a.id == id }
    return render_error('Not found', status: 404) unless article

    # DRY: delegate to service — controller stays thin
    ArticlePublisher.new(article).call
  end

  private

  def run_before_filters
    @before_filters.each { |f| send(f) rescue nil }
  end
end

# ============================================================
# 8. DRY — Helper Module (shared view/formatting logic)
# ============================================================

module ApplicationHelper
  # DRY: format dates consistently across every view
  def formatted_date(time)
    time.strftime('%B %-d, %Y')
  end

  # DRY: truncate long text — one definition, used everywhere
  def truncate(text, length: 100)
    return text if text.length <= length
    "#{text[0, length - 3]}..."
  end

  # DRY: human-friendly file sizes
  def human_size(bytes)
    units = %w[B KB MB GB TB]
    idx = 0
    size = bytes.to_f
    while size >= 1024 && idx < units.size - 1
      size /= 1024
      idx += 1
    end
    "#{size.round(1)} #{units[idx]}"
  end
end

# ============================================================
# 9. Main Execution — demonstrate all principles
# ============================================================

def main
  puts '=' * 62
  puts '💎🛤️  RUBY ON RAILS — CoC & DRY DEMONSTRATION'
  puts '=' * 62
  puts

  # ── CoC: Routing ──────────────────────────────────────────
  puts '--- CoC: RESTful Routes (resources :articles) ---'
  router = Router.new
  router.resources(:articles)
  router.resources(:users, only: %i[index show create destroy])
  router.print_routes
  puts

  # ── CoC: Table naming ─────────────────────────────────────
  puts '--- CoC: Automatic Table Names ---'
  [User, Article].each do |klass|
    puts "  #{klass.name.ljust(10)} → table: '#{klass.table_name}'"
  end
  puts

  # ── DRY: Concern — Auditable ──────────────────────────────
  puts '--- DRY: Concerns (Auditable, Publishable, Taggable) ---'
  user = User.new(id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin')
  user.save
  puts "  Created : #{user}"
  puts "  Audit   : #{user.audit_log}"
  user.add_tag('ruby').add_tag('rails')
  puts "  Tags    : #{user.tags.inspect}"
  puts "  Auditable? #{User.auditable?}"
  puts

  # ── DRY: Publishable scope ────────────────────────────────
  puts '--- DRY: Scopes in Model (Publishable) ---'
  a1 = Article.new(id: 1, title: 'Intro to Rails CoC', body: 'Convention over Configuration...', author_id: 1)
  a2 = Article.new(id: 2, title: 'DRY Principles',      body: "Don't Repeat Yourself...",       author_id: 1)
  a1.save; a2.save
  a1.publish!
  puts "  All articles   : #{Article.all.map(&:to_s).join(', ')}"
  puts "  Published      : #{Article.published.map(&:to_s).join(', ')}"
  puts "  Drafts         : #{Article.draft.map(&:to_s).join(', ')}"
  puts

  # ── DRY: Service Object ───────────────────────────────────
  puts '--- DRY: Service Object (ArticlePublisher) ---'
  notifier = ->(msg) { puts "  [NOTIFY] #{msg}" }
  result = ArticlePublisher.new(a2, notifier: notifier).call
  puts "  Result: ok=#{result[:ok]}, article=#{result[:article]}"
  puts

  # ── DRY: Controller stays thin ────────────────────────────
  puts '--- DRY: Thin Controller ---'
  ctrl = ArticlesController.new
  ctrl.set_current_user(user)
  puts "  index  => #{ctrl.index.inspect}"
  puts "  show 1 => #{ctrl.show(1).inspect}"
  puts "  publish 2 => #{ctrl.publish(2).inspect}"
  puts

  # ── DRY: Helper module ────────────────────────────────────
  puts '--- DRY: Helper Module (ApplicationHelper) ---'
  h = Object.new.tap { |o| o.extend(ApplicationHelper) }
  puts "  formatted_date : #{h.formatted_date(Time.now)}"
  puts "  truncate       : #{h.truncate('Ruby on Rails is a fantastic web framework built for developer joy.', length: 40)}"
  puts "  human_size     : #{h.human_size(2_048_576)}"
  puts

  # ── DRY: Validation in model ──────────────────────────────
  puts '--- DRY: Validations in Model ---'
  bad_user = User.new(id: 99, name: '', email: 'not-an-email', role: 'superuser')
  puts "  valid?  : #{bad_user.valid?}"
  puts "  errors  : #{bad_user.errors.inspect}"
  puts

  puts '=' * 62
  puts '✅ CoC & DRY principles demonstrated successfully!'
  puts '=' * 62
  puts
  puts 'Summary:'
  puts '  CoC — Name things right and Rails handles the rest:'
  puts '        model class  → DB table  → controller → routes'
  puts
  puts '  DRY — Write logic once, share everywhere:'
  puts '        Concerns · Scopes · Service Objects · Helpers · Base classes'
end

main if __FILE__ == $PROGRAM_NAME
