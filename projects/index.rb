# http://www.imagemagick.org/script/command-line-options.php
# http://www.cit.gu.edu.au/~anthony/graphics/imagick6/thumbnails/
# http://www.cit.gu.edu.au/~anthony/graphics/imagick6/annotating/

require 'rubygems'
require 'extensions/all'
require 'rexml/document'
require 'erb'

include REXML

module REXML
  class Element
    def first_element xpath
      get_elements(xpath).first
    end
  end
end

module Enumerable
  def sort_by! reverse=false, &block
    if reverse
      sort! {|a, b| block.call(b) <=> block.call(a)}
    else
      sort! {|a, b| block.call(a) <=> block.call(b)}
    end
  end
end

class XMLProxy
  attr_reader :base # for debugging
  
  def initialize(base, ns=nil)
    @base = base
    @ns = ns
  end
  
  def method_missing(sym, options={})
    name = sym.to_s
    ns = options[:ns] || @ns
    q = ns ? "#{ns}:" : ""
    qname = "#{q}#{name}"
    es = @base.get_elements(qname)
    if es.length == 1
      e = es.first
      return convert(e, ns, options[:type])
    end
    if es.empty? and @base.attributes[name]
      return @base.attributes[name]
    end
    return es.map{|e|convert(e, ns, options[:type])}
  end
  
  private
  def convert e, ns, type
    text = e.text
    text = Date.parse(text) if type == Date
    return XMLProxy.new(e, ns) if e.has_elements? or text.nil?
    return text
  end
end

class Project
  fields = [:name, :homepage, :created, :description, :tags, :role, :image, :languages, :company]
  attr_accessor *fields
  
  def created= date
    date = date.sub(/-\d\d(-\d\d)/, '') if date.gsub(/^.*(\d\d\d\d).*$/, '\1').to_i < 2005
    @created = date
    #@created = Date.parse(date)
  end
  
  def self.normcase t
    acronyms = %w{SQL PHP HTML XSLT HMM RDF FSA RIA AJAX}
    return "<abbr>#{t.upcase}</abbr>" if acronyms.include? t.upcase
    acronyms = %w{FOAF}
    return "<acronyms>#{t.upcase}</acronym>" if acronyms.include? t.upcase
    norms = %w{Apple Commodore-64Flash DocBook Flash Google-Maps Macintosh MacOS OpenLaszlo Rails WordNet WordPress}
    norms += %w{C Java Python Ruby C++ Dylan Lisp JavaScript}
    h = Hash[*norms.map{|w|[w.downcase,w]}.flatten]
    h[t] || t
  end
  
  def public_tags
    tags.reject{|tag|%w{major minor}.include? tag}.sort.map{|w|Project.normcase w}
  end
  
  def public_technologies
    languages.sort.map{|w|Project.normcase w}
  end
  
  def thumbnail
    image = @image
    image = 'images/python-logo.png (-transparent white)' if image==nil and languages.include? 'python'
    image = 'images/java-logo.jpg' if image==nil and languages.include? 'java'
    return unless image
    image =~ /(.*?)(?:\s*\((.*)\))?$/
    src, options = $1, $2
    src.sub!(/^\//, '../')
    target = 'images/' + src.sub(/^.*?([^\/]*?)(?:-small|-large)?\.([^.\/]+)$/, '\1-thumb.png')
    begin
      File.new(target).mtime
    rescue
      if !options and `identify #{src}`.sub(/^.*?(\d+)x(\d+).*$/, '\1').to_i < 150
        return src
      end
      `convert -resize '150>' #{options} #{src} #{target}`
    end
    return target
  end
end

def to_project file
  d = Document.new open(file).read
  pel = XMLProxy.new(d.first_element("//doap:Project"), 'doap')
  pr = Project.new
  pr.name = pel.name
  pr.homepage = pel.homepage.resource
  pr.created = pel.created
  pr.description = pel.description
  pr.tags = pel.send("programming-language")
  pr
end

def yaml_to_project y
  project = Project.new
  for key in %w{name created description homepage tags image languages company} do
    if y[key]
      value = y[key].value
      type = Object
      type = Array if %w{tags languages}.include?(key)
      value = value.split if type == Array
      project.send("#{key}=", value)
    end
  end
  raise "No date for #{project.name}" unless project.created
  project
end

def relativize(url)
  url.gsub(%r{^http://(www.)?osteele.com/}, '/')
end

def format_project project, s
  color = format("%02x", (255*(0.95-0.3*s)).to_i)*3
  fgcolor = format("%02x", (255*(0.2+0.3*s)).to_i)*3
  astart, aend = '', ''
  astart = %Q{<a href="#{project.homepage}">} if project.homepage and (project.tags.include? 'applet' or project.tags.include? 'website')
  aend = %Q{</a>} if astart != ''
  template = ERB.new(open('project-item.rhtml').read());
  template.result(binding).
    gsub!(/\s+,/, ',').
    gsub!(/^\s+$/, '').
    gsub!(/\n+/m, "\n")
end

def projects
  YAML.parse_file('projects.yaml').children.map{|y|yaml_to_project y}[1..-1]
end

def make_index
  require 'yaml'
  open('projects.php', 'w') do |f|
    projects.each_with_index do |project, index|
      f << format_project(project, index.to_f / projects.length)
      f << "\n"
    end
  end
  nil
end

def make_xml
  require 'yaml'
  require 'rubygems'
  require_gem 'builder'
  xm = Builder::XmlMarkup.new(:indent => 2)
  s = xm.projects {
    projects.each_with_index do |project, i|
      searchtext = [
        project.name, project.created,
        project.description, project.role,
        project.tags, project.languages].
        compact.flatten.join(' ').
        downcase.gsub(/<\/?.*?>/, '').gsub(/[<>"'=\/]/, ' ').
        gsub(/\s+/m, ' ')
      xm.project(:text => searchtext,
                 :name => project.name,
                 :index => i,
                 :tags => (project.tags+project.languages).uniq.join(' '))
    end
  }
  open('projects.xml', 'w') do |f| f.write(s) end
end

def clean_thumbnails
  `rm images/*-thumb.png`
end

def make_applet
  dir = File.expand_path '~/laszlo/lps-dev/nav'
  make_xml
  `cp projects.xml #{dir}`
  `curl -o nav.lzx.swf -s "http://localhost:8080/lps-dev/nav/nav.lzx?lzr=swf7&lzt=swf"`
  return
  `lzc #{dir}/nav.lzx`
  `cp #{dir}/nav.swf nav.lzx.swf`
end