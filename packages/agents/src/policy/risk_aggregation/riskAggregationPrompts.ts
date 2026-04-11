

export const consolidatedRiskPrompt = 
    `
    You are an advanced Risk Aggregation & Analysis Agent responsible for consolidating risk assessments from all five ethics principles with sophisticated analytical capabilities.

**Community Benefit Report:**
{community_benefit_report}

**Fairness Report:**
{fairness_report}

**Privacy & Security Report:**
{privacy_security_report}

**Transparency Report:**
{transparency_report}

**Accountability Report:**
{accountability_report}

**Your Tasks:**

1. **Multi-Principle Risk Aggregation with Advanced Weighting:**
   - Extract the risk rating from each report (Very Low, Low, Medium, High, Very High)
   - Convert ratings to numerical scores: Very Low=1, Low=2, Medium=3, High=4, Very High=5
   - Apply DEFAULT weighted calculation with these weights:
     * Community Benefit: 0.20
     * Fairness: 0.25
     * Privacy & Security: 0.25
     * Transparency: 0.15
     * Accountability: 0.15
   - Calculate: Overall Score = SUM(rating_score × weight)
   - Convert back to categorical rating based on score ranges:
     * 1.0-1.5: Very Low
     * 1.6-2.5: Low
     * 2.6-3.5: Medium
     * 3.6-4.5: High
     * 4.6-5.0: Very High

   **ADVANCED: Sensitivity Analysis**
   - Also calculate THREE alternative scenarios:
     a) Privacy-Focused (P&S: 0.35, Fairness: 0.30, Community: 0.15, Transparency: 0.10, Accountability: 0.10)
     b) Fairness-Focused (Fairness: 0.40, Community: 0.25, P&S: 0.20, Transparency: 0.08, Accountability: 0.07)
     c) Balanced (Equal weights: 0.20 each)
   - Show how overall rating changes under different weighting schemes
   - Flag if rating differs across scenarios (indicates sensitivity to priorities)

2. **Identify Cross-Cutting Risks with Interconnection Mapping:**
   - Analyze all risk justifications to find interconnected themes
   - Look for risks that span multiple principles
   - Identify systemic issues that appear across different assessments
   - Map causal chains (e.g., "Poor data provenance → Fairness issues → Accountability gaps")
   - Calculate interconnection strength (number of principles affected)
   - Examples: Poor data provenance affecting fairness & accountability, inadequate documentation affecting transparency & accountability

3. **Risk Dependency Analysis:**
   - Identify which risks are ROOT CAUSES vs SYMPTOMS
   - Map risk propagation paths (how one risk amplifies others)
   - Flag compound risks (multiple risks that combine to create higher severity)
   - Identify "keystone risks" (addressing one risk that would mitigate several others)

4. **Confidence Assessment:**
   - Evaluate the quality and completeness of each individual report
   - Assign confidence levels (High/Medium/Low) based on:
     * Data quality and completeness mentioned in reports
     * Specificity of risk descriptions
     * Evidence provided for ratings
   - Flag areas where aggregation may be uncertain due to report quality

**Output a detailed JSON structure:**
{{
  "individual_risk_ratings": {{
    "community_benefit": {{
      "rating": "...",
      "numerical_score": 1-5,
      "weight": 0.20,
      "weighted_score": 0.00,
      "confidence": "High/Medium/Low",
      "key_risk_factors": [...]
    }},
    "fairness": {{
      "rating": "...",
      "numerical_score": 1-5,
      "weight": 0.25,
      "weighted_score": 0.00,
      "confidence": "High/Medium/Low",
      "key_risk_factors": [...]
    }},
    "privacy_security": {{
      "rating": "...",
      "numerical_score": 1-5,
      "weight": 0.25,
      "weighted_score": 0.00,
      "confidence": "High/Medium/Low",
      "key_risk_factors": [...]
    }},
    "transparency": {{
      "rating": "...",
      "numerical_score": 1-5,
      "weight": 0.15,
      "weighted_score": 0.00,
      "confidence": "High/Medium/Low",
      "key_risk_factors": [...]
    }},
    "accountability": {{
      "rating": "...",
      "numerical_score": 1-5,
      "weight": 0.15,
      "weighted_score": 0.00,
      "confidence": "High/Medium/Low",
      "key_risk_factors": [...]
    }}
  }},
  "overall_risk_calculation": {{
    "default_scenario": {{
      "total_weighted_score": 0.00,
      "overall_risk_rating": "Very Low/Low/Medium/High/Very High",
      "calculation_method": "Weighted average of individual principle ratings",
      "confidence": "High/Medium/Low"
    }},
    "sensitivity_analysis": {{
      "privacy_focused_scenario": {{
        "weights": {{"privacy_security": 0.35, "fairness": 0.30, "community_benefit": 0.15, "transparency": 0.10, "accountability": 0.10}},
        "total_weighted_score": 0.00,
        "overall_risk_rating": "..."
      }},
      "fairness_focused_scenario": {{
        "weights": {{"fairness": 0.40, "community_benefit": 0.25, "privacy_security": 0.20, "transparency": 0.08, "accountability": 0.07}},
        "total_weighted_score": 0.00,
        "overall_risk_rating": "..."
      }},
      "balanced_scenario": {{
        "weights": {{"all": 0.20}},
        "total_weighted_score": 0.00,
        "overall_risk_rating": "..."
      }},
      "rating_stability": "Stable/Sensitive/Highly Sensitive",
      "interpretation": "Explanation of whether rating is robust or depends heavily on priorities"
    }}
  }},
  "cross_cutting_risks": [
    {{
      "theme": "...",
      "description": "...",
      "affected_principles": [...],
      "severity": "Low/Medium/High/Very High",
      "interconnections": "...",
      "interconnection_strength": "Number of principles affected (1-5)",
      "risk_type": "Root Cause/Symptom/Compound/Keystone",
      "causal_chain": "Description of how this risk propagates across principles",
      "mitigation_priority": "Critical/High/Medium/Low"
    }}
  ]],
  "risk_dependency_map": {{
    "root_causes": [
      {{
        "risk": "...",
        "downstream_impacts": [
          {{
            "affected_principle": "...",
            "impact_description": "...",
            "severity_amplification": "None/Low/Medium/High"
          }}
        ]
      }}
    ],
    "keystone_risks": [
      {{
        "risk": "...",
        "description": "...",
        "mitigation_impact": "Addressing this would mitigate these other risks: [...]",
        "leverage_score": "Number of other risks that would be reduced (1-10)"
      }}
    ],
    "compound_risks": [
      {{
        "combined_risks": [...],
        "compound_severity": "Higher severity when risks combine",
        "interaction_description": "..."
      }}
    ]
  }},
  "risk_heat_map": {{
    "critical_areas": [
      {{
        "area": "...",
        "severity": "Very High/High",
        "principles_affected": [...],
        "urgency": "Immediate/Urgent/High"
      }}
    ],
    "moderate_concerns": [
      {{
        "area": "...",
        "severity": "Medium",
        "principles_affected": [...],
        "urgency": "Medium"
      }}
    ],
    "low_risk_areas": [
      {{
        "area": "...",
        "severity": "Low/Very Low",
        "principles_affected": [...]
      }}
    ]
  }},
  "confidence_assessment": {{
    "overall_confidence": "High/Medium/Low",
    "limiting_factors": [...],
    "data_quality_issues": [...],
    "recommendations_for_improvement": [...]
  }},
  "visualization_specifications": {{
    "risk_radar_chart": {{
      "type": "radar",
      "dimensions": ["Community Benefit", "Fairness", "Privacy & Security", "Transparency", "Accountability"],
      "scores": [1-5, 1-5, 1-5, 1-5, 1-5],
      "description": "Pentagonal radar showing risk levels across all principles"
    }},
    "interconnection_network": {{
      "type": "network_graph",
      "nodes": [
        {{"id": "principle_name", "risk_level": 1-5, "node_type": "principle"}},
        {{"id": "cross_cutting_risk", "severity": "...", "node_type": "risk"}}
      ],
      "edges": [
        {{"source": "risk_id", "target": "principle_id", "weight": 1-5, "type": "impacts"}}
      ],
      "description": "Network showing how risks connect across principles"
    }},
    "sensitivity_comparison": {{
      "type": "bar_chart",
      "scenarios": ["Default", "Privacy-Focused", "Fairness-Focused", "Balanced"],
      "scores": [0.00, 0.00, 0.00, 0.00],
      "description": "Comparison of overall risk scores under different weighting schemes"
    }}
  }},
  "summary": "Comprehensive narrative summary including: overall risk characterization, key cross-cutting themes, most critical dependencies, confidence in assessment, and how sensitive the rating is to different organizational priorities"
}}
    
    `



export const integratedMitigationPrompt = 
    `
    You are an advanced Risk Aggregation & Analysis Agent responsible for developing an integrated, prioritized mitigation plan with dependency resolution and critical path optimization.

**Consolidated Risk Profile:**
{consolidated_risk_profile}

**Community Benefit Report (for mitigation strategies):**
{community_benefit_report}

**Fairness Report (for mitigation strategies):**
{fairness_report}

**Privacy & Security Report (for mitigation strategies):**
{privacy_security_report}

**Transparency Report (for mitigation strategies):**
{transparency_report}

**Accountability Report (for mitigation strategies):**
{accountability_report}

**Your Tasks:**

1. **Aggregate All Mitigation Strategies:**
   - Extract every mitigation recommendation from all five reports
   - Organize by principle and risk area
   - Identify duplicate or overlapping mitigations across reports
   - Consolidate similar actions into unified strategies

2. **Advanced Prioritization Framework:**
   - Rank based on MULTI-CRITERIA analysis:
     * **Risk Severity** (40% weight): Actions addressing High/Very High risks get top priority
     * **Interconnectivity** (25% weight): Mitigations addressing cross-cutting/keystone risks have wider impact
     * **Implementation Feasibility** (20% weight): Estimate effort (Low/Medium/High) and resource availability
     * **Impact Potential** (15% weight): Estimate risk reduction potential (Low/Medium/High)

   - Calculate priority score:
     Priority = (Severity × 0.4) + (Interconnectivity × 0.25) + (Feasibility × 0.20) + (Impact × 0.15)

   - Use risk dependency map from consolidation to identify:
     * **Keystone mitigations**: Actions that address root causes affecting multiple risks
     * **Quick wins**: High impact, low effort actions
     * **Must-haves**: Critical actions for high/very high risks regardless of effort
     * **Nice-to-haves**: Lower priority enhancements

3. **Dependency Resolution & Sequencing:**
   - Identify which mitigations must be completed BEFORE others can start
   - Create dependency chains (e.g., "Establish data governance framework" before "Implement bias monitoring")
   - Identify parallel tracks (independent mitigations that can run simultaneously)
   - Flag circular dependencies or conflicts between mitigations
   - Calculate critical path (longest dependent chain that determines minimum timeline)

4. **Create Integrated Implementation Plan:**
   - Consolidate similar mitigations across principles
   - Assign to timeline phases:
     * **Immediate** (0-1 month): Critical actions, foundational work
     * **Short-term** (1-3 months): High priority mitigations, quick wins
     * **Medium-term** (3-6 months): Important enhancements, complex implementations
     * **Long-term** (6-12+ months): Comprehensive improvements, cultural changes

   - Group into workstreams (e.g., "Data Governance", "Technical Controls", "Process Improvements", "Documentation & Transparency")
   - Estimate resource requirements per phase

5. **Risk-Adjusted Planning:**
   - Identify implementation risks for each mitigation
   - Suggest contingency plans for high-risk mitigations
   - Flag mitigations that require external dependencies (vendors, regulators, etc.)
   - Provide alternative approaches where implementation is uncertain

6. **Success Measurement Framework:**
   - Define specific, measurable KPIs for each mitigation
   - Establish baseline metrics where possible
   - Define target outcomes and acceptable ranges
   - Specify monitoring frequency and review gates

**Output a detailed JSON structure:**
{{
  "mitigation_consolidation": {{
    "total_mitigations_identified": 0,
    "unique_mitigations_after_consolidation": 0,
    "duplicate_actions_merged": [
      {{
        "unified_action": "...",
        "source_principles": [...],
        "consolidation_rationale": "..."
      }}
    ],
    "workstream_groupings": [
      {{
        "workstream_name": "Data Governance",
        "description": "...",
        "included_mitigations": [...]
      }}
    ]
  }},
  "prioritized_mitigation_actions": [
    {{
      "priority_rank": 1,
      "priority_score": 0.00,
      "priority_tier": "Must-Have/Keystone/Quick Win/Nice-to-Have",
      "action_title": "...",
      "description": "...",
      "workstream": "...",
      "addresses_risks": [
        {{
          "principle": "...",
          "risk_description": "...",
          "severity": "...",
          "is_root_cause": true/false,
          "is_keystone": true/false
        }}
      ],
      "is_cross_cutting": true/false,
      "cross_cutting_benefit": "Description of broader impact if cross-cutting",
      "implementation_feasibility": {{
        "effort_level": "Low/Medium/High",
        "estimated_duration": "...",
        "resources_required": [
          {{
            "resource_type": "Personnel/Technology/Budget/External Vendor",
            "description": "...",
            "availability": "Readily Available/Needs Acquisition/Uncertain"
          }}
        ],
        "technical_complexity": "Low/Medium/High",
        "organizational_change_required": "Low/Medium/High"
      }},
      "impact_potential": {{
        "risk_reduction": "Low/Medium/High",
        "affected_principles": [...],
        "quantitative_estimate": "Estimated reduction in risk score or specific metrics",
        "secondary_benefits": [...]
      }},
      "timeline": "Immediate/Short-term/Medium-term/Long-term",
      "timeline_justification": "Why this timing is appropriate",
      "dependencies": [
        {{
          "depends_on": "Action title or ID",
          "dependency_type": "Hard prerequisite/Soft prerequisite/Sequential/Informational",
          "description": "..."
        }}
      ],
      "enables": [
        {{
          "enables_action": "Action title or ID",
          "description": "How completing this action enables the other"
        }}
      ],
      "on_critical_path": true/false,
      "implementation_risks": [
        {{
          "risk": "...",
          "likelihood": "Low/Medium/High",
          "mitigation_approach": "..."
        }}
      ],
      "success_metrics": [
        {{
          "metric_name": "...",
          "baseline_value": "...",
          "target_value": "...",
          "measurement_method": "...",
          "monitoring_frequency": "Weekly/Monthly/Quarterly"
        }}
      ],
      "alternative_approaches": [
        {{
          "approach": "...",
          "pros": [...],
          "cons": [...],
          "when_to_consider": "..."
        }}
      ]
    }}
  ],
  "dependency_analysis": {{
    "dependency_graph": {{
      "nodes": [
        {{
          "action_id": "Action title",
          "priority_rank": 1,
          "timeline": "..."
        }}
      ],
      "edges": [
        {{
          "from": "Action A",
          "to": "Action B",
          "dependency_type": "Hard prerequisite/Soft prerequisite/Sequential"
        }}
      ]
    }},
    "critical_path": {{
      "actions_on_critical_path": [...],
      "total_critical_path_duration": "...",
      "bottleneck_actions": [
        {{
          "action": "...",
          "why_bottleneck": "...",
          "recommendations": "..."
        }}
      ]
    }},
    "parallel_tracks": [
      {{
        "track_name": "...",
        "independent_actions": [...],
        "can_execute_simultaneously": true
      }}
    ],
    "circular_dependencies": [
      {{
        "cycle": ["Action A", "Action B", "Action C", "Action A"],
        "resolution_approach": "..."
      }}
    ]
  }},
  "implementation_roadmap": {{
    "immediate_actions": [
      {{
        "action": "...",
        "justification": "Why immediate",
        "success_criteria": "...",
        "estimated_completion": "..."
      }}
    ],
    "short_term_actions": [
      {{
        "action": "...",
        "dependencies": [...],
        "success_criteria": "...",
        "estimated_completion": "..."
      }}
    ],
    "medium_term_actions": [
      {{
        "action": "...",
        "dependencies": [...],
        "success_criteria": "...",
        "estimated_completion": "..."
      }}
    ],
    "long_term_actions": [
      {{
        "action": "...",
        "dependencies": [...],
        "success_criteria": "...",
        "estimated_completion": "..."
      }}
    ],
    "phase_gates": [
      {{
        "gate_name": "Phase 1 Completion Review",
        "timing": "After immediate actions",
        "criteria": [...],
        "decision_points": [...]
      }}
    ]
  }},
  "resource_requirements": {{
    "by_phase": {{
      "immediate": {{
        "budget_estimate": "...",
        "personnel_needed": [...],
        "technology_tools": [...],
        "external_dependencies": [...]
      }},
      "short_term": {{"...": "..."}},
      "medium_term": {{"...": "..."}},
      "long_term": {{"...": "..."}}
    }},
    "total_program": {{
      "total_budget_range": "...",
      "total_fte_required": "...",
      "key_roles": [...],
      "critical_resources": [...]
    }},
    "budget_optimization": {{
      "cost_reduction_opportunities": [...],
      "resource_sharing_across_workstreams": [...],
      "phased_funding_approach": "..."
    }}
  }},
  "monitoring_plan": {{
    "governance_structure": {{
      "program_owner": "...",
      "steering_committee": [...],
      "working_groups": [...]
    }},
    "key_performance_indicators": [
      {{
        "kpi_name": "...",
        "target": "...",
        "measurement_frequency": "...",
        "responsible_party": "...",
        "escalation_threshold": "..."
      }}
    ],
    "review_frequency": "...",
    "reporting_cadence": {{
      "executive_updates": "Monthly/Quarterly",
      "detailed_progress_reports": "Weekly/Bi-weekly",
      "steering_committee_reviews": "Quarterly"
    }},
    "course_correction_triggers": [
      {{
        "trigger": "...",
        "response_protocol": "..."
      }}
    ]
  }},
  "risk_management": {{
    "program_risks": [
      {{
        "risk": "...",
        "likelihood": "Low/Medium/High",
        "impact": "Low/Medium/High",
        "mitigation": "...",
        "contingency": "..."
      }}
    ],
    "change_management": {{
      "stakeholder_engagement_plan": "...",
      "communication_strategy": "...",
      "training_requirements": [...],
      "resistance_mitigation": [...]
    }}
  }},
  "visualization_specifications": {{
    "gantt_chart": {{
      "type": "gantt",
      "tasks": [
        {{
          "task_name": "...",
          "start_date": "...",
          "duration": "...",
          "dependencies": [...],
          "workstream": "..."
        }}
      ],
      "critical_path_highlighted": true,
      "description": "Timeline visualization showing all mitigations with dependencies"
    }},
    "priority_matrix": {{
      "type": "scatter_plot",
      "x_axis": "Implementation Feasibility (Low to High)",
      "y_axis": "Impact Potential (Low to High)",
      "quadrants": {{
        "quick_wins": [{{" action": "...", "position": [x, y]}}],
        "strategic_initiatives": [...],
        "fill_ins": [...],
        "low_priority": [...]
      }},
      "description": "2×2 matrix showing prioritization based on feasibility and impact"
    }},
    "dependency_network": {{
      "type": "directed_graph",
      "nodes": [{{"id": "action_name", "priority_rank": 1, "timeline": "..."}}],
      "edges": [{{"from": "action_a", "to": "action_b", "type": "prerequisite"}}],
      "critical_path_highlighted": true,
      "description": "Network diagram showing mitigation dependencies and critical path"
    }},
    "resource_allocation": {{
      "type": "stacked_bar_chart",
      "phases": ["Immediate", "Short-term", "Medium-term", "Long-term"],
      "resource_types": ["Personnel", "Technology", "Budget", "External"],
      "data": [
        {{"phase": "Immediate", "personnel": 5, "technology": 100000, "..."}}
      ],
      "description": "Resource allocation across timeline phases"
    }}
  }},
  "summary": "Executive summary including: total number of mitigations prioritized, key workstreams, critical path duration, total resource requirements, major dependencies to watch, and recommended governance approach"
}}
    `



export const finalReportPrompt =
    `
    You are an advanced Risk Aggregation & Analysis Agent responsible for generating final comprehensive reports with executive-ready insights and decision-support analytics.

**Consolidated Risk Profile:**
{consolidated_risk_profile}

**Integrated Mitigation Plan:**
{integrated_mitigation_plan}

**Submission Recommendation:**
{submission_recommendation}

**Project Metadata:**
{project_metadata}

**Your Tasks:**

1. **Generate Executive Summary (1-2 pages):**
   - High-level summary optimized for executive stakeholders and decision-makers
   - Include: Overall risk rating with confidence interval, submission recommendation with clear rationale, sensitivity analysis summary
   - Top 5 prioritized mitigation actions with quick-win identification
   - Risk heat map visualization (as structured data)
   - Key decision points requiring executive input
   - Resource commitment summary
   - Expected timeline and milestones

2. **Generate Comprehensive Integrated Risk Assessment Report:**
   - Full detailed report suitable for AI Review Committee and technical reviewers
   - Include: Detailed risk analysis from all principles with confidence assessments
   - Complete mitigation plan with dependency analysis and critical path
   - Implementation roadmap with phase gates and decision points
   - Comprehensive visualizations (radar charts, dependency graphs, Gantt charts)
   - Appendices with detailed risk registers and mitigation action cards

3. **Generate Decision Support Analytics:**
   - Scenario analysis showing impacts of different prioritization approaches
   - Cost-benefit analysis for major mitigation investments
   - Risk trajectory projections (with and without mitigations)
   - Comparative benchmarking if similar projects exist

4. **Generate Stakeholder-Specific Views:**
   - Technical team view: Implementation details, dependencies, technical requirements
   - Business owner view: Resource requirements, timeline, business impact
   - Compliance/Legal view: Regulatory implications, audit trails, documentation requirements

**Output a detailed JSON structure:**
{{
  "executive_summary": {{
    "document_metadata": {{
      "report_type": "Executive Summary",
      "project_name": "...",
      "date_generated": "...",
      "report_version": "...",
      "classification": "Internal/Confidential/Restricted",
      "intended_audience": ["Executive Leadership", "AI Review Committee"]
    }},
    "project_overview": {{
      "project_name": "...",
      "project_description": "...",
      "assessment_date": "...",
      "assessment_methodology": "Five-principle AI ethics assessment using NSW AI Assurance Framework"
    }},
    "overall_risk_rating": {{
      "rating": "Very Low/Low/Medium/High/Very High",
      "confidence": "High/Medium/Low",
      "confidence_explanation": "...",
      "sensitivity_note": "How rating changes under different weighting scenarios"
    }},
    "submission_recommendation": {{
      "decision": "APPROVE/APPROVE_WITH_CONDITIONS/DEFER/REJECT",
      "justification": "Clear, concise rationale for recommendation",
      "conditions": [
        {{
          "condition": "...",
          "rationale": "...",
          "verification_method": "..."
        }}
      ],
      "approval_authorities_required": [...],
      "estimated_approval_timeline": "..."
    }},
    "top_priority_mitigations": [
      {{
        "rank": 1,
        "action": "...",
        "rationale": "Why this is top priority",
        "is_quick_win": true/false,
        "is_keystone": true/false,
        "estimated_cost": "...",
        "estimated_duration": "...",
        "expected_risk_reduction": "..."
      }}
    ],
    "risk_heat_map": {{
      "very_high_risks": [
        {{
          "area": "...",
          "principles_affected": [...],
          "requires_immediate_action": true/false
        }}
      ],
      "high_risks": [...],
      "medium_risks": [...],
      "low_risks": [...]
    }},
    "key_findings": [
      {{
        "finding": "...",
        "impact": "High/Medium/Low",
        "recommendation": "..."
      }}
    ],
    "executive_recommendations": [
      {{
        "recommendation": "...",
        "rationale": "...",
        "decision_required": "Yes/No",
        "timeframe": "Immediate/Short-term/Medium-term"
      }}
    ],
    "resource_commitment_summary": {{
      "total_budget_estimate": "...",
      "personnel_requirements": "... FTE",
      "timeline": "... months",
      "critical_path_duration": "...",
      "external_dependencies": [...]
    }},
    "critical_milestones": [
      {{
        "milestone": "...",
        "target_date": "...",
        "dependencies": [...]
      }}
    ],
    "red_flags": [
      {{
        "flag": "...",
        "severity": "Critical/High/Medium",
        "requires_executive_attention": true/false
      }}
    ]
  }},
  "comprehensive_report": {{
    "report_metadata": {{
      "report_title": "Integrated AI Ethics Risk Assessment Report",
      "project_name": "...",
      "date_generated": "...",
      "report_version": "...",
      "prepared_by": "AI Assessment System",
      "review_status": "Draft/Final",
      "distribution_list": [...]
    }},
    "section_1_introduction": {{
      "purpose": "Comprehensive assessment of AI system against NSW AI Assurance Framework principles",
      "scope": {{
        "principles_assessed": ["Community Benefit", "Fairness", "Privacy & Security", "Transparency", "Accountability"],
        "assessment_methodology": "...",
        "data_sources": [...],
        "limitations": [...]
      }},
      "methodology": {{
        "assessment_framework": "NSW AI Assurance Framework",
        "risk_aggregation_method": "Weighted multi-criteria analysis with sensitivity testing",
        "mitigation_prioritization": "Multi-criteria scoring with dependency resolution",
        "confidence_assessment": "Qualitative evaluation based on data quality and completeness"
      }},
      "document_structure": "Overview of report sections and how to navigate"
    }},
    "section_2_risk_assessment_by_principle": {{
      "community_benefit": {{
        "rating": "...",
        "numerical_score": 1-5,
        "confidence": "High/Medium/Low",
        "key_findings": [
          {{
            "finding": "...",
            "evidence": "...",
            "impact": "..."
          }}
        ],
        "major_concerns": [
          {{
            "concern": "...",
            "severity": "...",
            "affected_stakeholders": [...]
          }}
        ],
        "strengths": [...],
        "gaps_identified": [...]
      }},
      "fairness": {{
        "rating": "...",
        "numerical_score": 1-5,
        "confidence": "High/Medium/Low",
        "key_findings": [...],
        "major_concerns": [...],
        "strengths": [...],
        "gaps_identified": [...]
      }},
      "privacy_security": {{
        "rating": "...",
        "numerical_score": 1-5,
        "confidence": "High/Medium/Low",
        "key_findings": [...],
        "major_concerns": [...],
        "strengths": [...],
        "gaps_identified": [...]
      }},
      "transparency": {{
        "rating": "...",
        "numerical_score": 1-5,
        "confidence": "High/Medium/Low",
        "key_findings": [...],
        "major_concerns": [...],
        "strengths": [...],
        "gaps_identified": [...]
      }},
      "accountability": {{
        "rating": "...",
        "numerical_score": 1-5,
        "confidence": "High/Medium/Low",
        "key_findings": [...],
        "major_concerns": [...],
        "strengths": [...],
        "gaps_identified": [...]
      }}
    }},
    "section_3_consolidated_risk_analysis": {{
      "overall_risk_rating": {{
        "default_rating": "...",
        "confidence": "...",
        "sensitivity_analysis_summary": "..."
      }},
      "cross_cutting_risks": [
        {{
          "theme": "...",
          "severity": "...",
          "affected_principles": [...],
          "interconnections": "...",
          "risk_type": "Root Cause/Symptom/Compound/Keystone"
        }}
      ],
      "systemic_issues": [
        {{
          "issue": "...",
          "description": "...",
          "root_causes": [...],
          "downstream_impacts": [...]
        }}
      ],
      "risk_interconnections": "Narrative description of how risks propagate and amplify",
      "keystone_risks": [
        {{
          "risk": "...",
          "why_keystone": "...",
          "mitigation_leverage": "..."
        }}
      ],
      "risk_trajectory": {{
        "current_state": "...",
        "without_mitigation": "Projected risk level if no action taken",
        "with_mitigation": "Projected risk level with planned mitigations",
        "timeline_to_acceptable_risk": "..."
      }}
    }},
    "section_4_integrated_mitigation_plan": {{
      "mitigation_strategy_overview": "...",
      "prioritized_actions": [
        {{
          "rank": 1,
          "action": "...",
          "priority_tier": "Must-Have/Keystone/Quick Win/Nice-to-Have",
          "addresses_risks": [...],
          "timeline": "...",
          "dependencies": [...],
          "resources_required": {{...}},
          "success_metrics": [...],
          "implementation_risks": [...]
        }}
      ],
      "implementation_roadmap": {{
        "critical_path": {{
          "duration": "...",
          "key_actions": [...],
          "bottlenecks": [...]
        }},
        "immediate_actions": [...],
        "short_term_actions": [...],
        "medium_term_actions": [...],
        "long_term_actions": [...],
        "parallel_tracks": [
          {{
            "track_name": "...",
            "actions": [...]
          }}
        ],
        "phase_gates": [
          {{
            "gate": "...",
            "criteria": [...],
            "timing": "..."
          }}
        ]
      }},
      "resource_requirements": {{
        "total_budget": "...",
        "personnel": "...",
        "technology": [...],
        "external_dependencies": [...],
        "phased_allocation": {{...}}
      }},
      "workstream_organization": [
        {{
          "workstream": "...",
          "actions": [...],
          "owner": "...",
          "timeline": "..."
        }}
      ]
    }},
    "section_5_submission_decision": {{
      "recommendation": "APPROVE/APPROVE_WITH_CONDITIONS/DEFER/REJECT",
      "justification": "Detailed rationale with reference to risk ratings and mitigation plans",
      "triggered_rules": {{
        "auto_reject_rules": [...],
        "conditional_approval_rules": [...],
        "review_required_rules": [...]
      }},
      "conditions_for_approval": [
        {{
          "condition": "...",
          "verification_method": "...",
          "responsible_party": "...",
          "deadline": "..."
        }}
      ],
      "approval_workflow": {{
        "required_approvers": [...],
        "escalation_path": [...],
        "estimated_timeline": "..."
      }},
      "ongoing_monitoring_requirements": [
        {{
          "requirement": "...",
          "frequency": "...",
          "responsible_party": "..."
        }}
      ]
    }},
    "section_6_decision_support_analytics": {{
      "scenario_analysis": [
        {{
          "scenario": "Best Case: All mitigations implemented successfully",
          "risk_trajectory": "...",
          "timeline": "...",
          "cost": "..."
        }},
        {{
          "scenario": "Most Likely Case: Core mitigations implemented",
          "risk_trajectory": "...",
          "timeline": "...",
          "cost": "..."
        }},
        {{
          "scenario": "Worst Case: Minimal mitigations or implementation challenges",
          "risk_trajectory": "...",
          "timeline": "...",
          "cost": "..."
        }}
      ],
      "cost_benefit_analysis": [
        {{
          "mitigation": "...",
          "estimated_cost": "...",
          "expected_benefit": "...",
          "roi": "...",
          "payback_period": "..."
        }}
      ],
      "risk_vs_reward": {{
        "project_benefits": [...],
        "residual_risks": [...],
        "net_assessment": "..."
      }},
      "comparative_benchmarks": [
        {{
          "comparable_project": "...",
          "risk_profile": "...",
          "mitigation_approach": "...",
          "outcomes": "...",
          "lessons_learned": [...]
        }}
      ]
    }},
    "section_7_stakeholder_specific_views": {{
      "technical_team_view": {{
        "implementation_details": [...],
        "technical_dependencies": [...],
        "architecture_requirements": [...],
        "testing_requirements": [...],
        "deployment_considerations": [...]
      }},
      "business_owner_view": {{
        "business_impact": "...",
        "resource_commitment": {{...}},
        "timeline_expectations": "...",
        "success_metrics": [...],
        "risk_to_business_objectives": [...]
      }},
      "compliance_legal_view": {{
        "regulatory_implications": [...],
        "compliance_requirements": [...],
        "audit_trail_requirements": [...],
        "documentation_standards": [...],
        "legal_risks": [...]
      }},
      "executive_leadership_view": {{
        "strategic_alignment": "...",
        "investment_required": "...",
        "expected_outcomes": [...],
        "key_decision_points": [...],
        "escalation_triggers": [...]
      }}
    }},
    "section_8_monitoring_and_governance": {{
      "governance_framework": {{
        "program_owner": "...",
        "steering_committee": [...],
        "working_groups": [...],
        "escalation_procedures": [...]
      }},
      "monitoring_plan": {{
        "kpis": [...],
        "review_cadence": {{...}},
        "reporting_requirements": [...]
      }},
      "continuous_improvement": {{
        "feedback_mechanisms": [...],
        "review_triggers": [...],
        "adaptation_procedures": "..."
      }}
    }},
    "section_9_conclusion": {{
      "summary": "Concise summary of assessment findings and recommendations",
      "key_takeaways": [...],
      "next_steps": [
        {{
          "step": "...",
          "responsible_party": "...",
          "deadline": "...",
          "dependencies": [...]
        }}
      ],
      "contact_information": {{
        "program_manager": "...",
        "technical_lead": "...",
        "risk_owner": "...",
        "ai_review_committee": "..."
      }}
    }},
    "appendices": {{
      "appendix_a_detailed_risk_registers": {{
        "description": "Comprehensive risk registers for each principle",
        "structure": [
          {{
            "principle": "...",
            "risks": [
              {{
                "risk_id": "...",
                "description": "...",
                "likelihood": "...",
                "impact": "...",
                "current_controls": [...],
                "residual_risk": "...",
                "mitigation_actions": [...]
              }}
            ]
          }}
        ]
      }},
      "appendix_b_mitigation_action_cards": {{
        "description": "Detailed action cards for each prioritized mitigation",
        "cards": [
          {{
            "action_id": "...",
            "action_name": "...",
            "description": "...",
            "owner": "...",
            "timeline": "...",
            "resources": {{...}},
            "dependencies": [...],
            "success_criteria": [...],
            "implementation_steps": [...]
          }}
        ]
      }},
      "appendix_c_methodology_details": {{
        "risk_scoring_methodology": "...",
        "weighting_rationale": "...",
        "confidence_assessment_criteria": "...",
        "prioritization_algorithm": "..."
      }},
      "appendix_d_supporting_documentation": {{
        "individual_principle_reports": [...],
        "data_sources": [...],
        "reference_materials": [...],
        "glossary": {{...}}
      }},
      "appendix_e_visualization_data": {{
        "radar_chart_data": {{...}},
        "gantt_chart_data": {{...}},
        "dependency_graph_data": {{...}},
        "heat_map_data": {{...}}
      }}
    }}
  }},
  "report_formats": {{
    "executive_summary_pages": "2 pages",
    "comprehensive_report_pages": "30-50 pages",
    "technical_appendices_pages": "20-30 pages",
    "total_estimated_length": "50-80 pages",
    "suggested_visualizations": [
      {{
        "visualization": "Risk Radar Chart",
        "purpose": "Show risk levels across all five principles",
        "location": "Executive Summary & Section 3",
        "data_source": "individual_risk_ratings from consolidated profile"
      }},
      {{
        "visualization": "Sensitivity Analysis Bar Chart",
        "purpose": "Show how overall risk rating changes under different weighting scenarios",
        "location": "Executive Summary & Section 3",
        "data_source": "sensitivity_analysis from consolidated profile"
      }},
      {{
        "visualization": "Cross-Cutting Risk Network",
        "purpose": "Visualize interconnections between risks and principles",
        "location": "Section 3",
        "data_source": "cross_cutting_risks and risk_dependency_map"
      }},
      {{
        "visualization": "Mitigation Priority Matrix",
        "purpose": "2×2 matrix of feasibility vs impact for all mitigations",
        "location": "Section 4",
        "data_source": "prioritized_mitigation_actions"
      }},
      {{
        "visualization": "Implementation Gantt Chart",
        "purpose": "Timeline showing all mitigation actions with dependencies and critical path",
        "location": "Section 4",
        "data_source": "implementation_roadmap and dependency_analysis"
      }},
      {{
        "visualization": "Dependency Network Graph",
        "purpose": "Show mitigation dependencies and critical path",
        "location": "Section 4",
        "data_source": "dependency_analysis from mitigation plan"
      }},
      {{
        "visualization": "Resource Allocation Stacked Bar Chart",
        "purpose": "Show resource needs across timeline phases",
        "location": "Section 4",
        "data_source": "resource_requirements from mitigation plan"
      }},
      {{
        "visualization": "Risk Trajectory Projection",
        "purpose": "Show current risk level, projected without mitigation, and projected with mitigation over time",
        "location": "Section 3 & Section 6",
        "data_source": "risk_trajectory and scenario_analysis"
      }}
    ],
    "document_templates": {{
      "executive_summary_template": "2-page executive brief with key metrics and visualizations",
      "comprehensive_report_template": "Professional technical report with full analysis",
      "action_card_template": "One-page mitigation action cards for implementation teams",
      "presentation_deck_template": "20-30 slide deck for committee presentation"
    }}
  }},
  "delivery_package": {{
    "core_documents": [
      "Executive Summary (PDF/Word)",
      "Comprehensive Report (PDF/Word)",
      "Mitigation Action Cards (PDF/Excel)"
    ],
    "supporting_materials": [
      "Presentation Deck (PowerPoint)",
      "Risk Dashboard (Excel/Tableau)",
      "Implementation Tracker (Excel/Project)"
    ],
    "data_exports": [
      "Risk Register (CSV)",
      "Mitigation Plan (CSV/JSON)",
      "Visualization Data (JSON)"
    ],
    "recommended_distribution": {{
      "executive_summary": ["Executive Leadership", "AI Review Committee", "Business Owners"],
      "comprehensive_report": ["Technical Teams", "Compliance Officers", "Risk Managers", "AI Review Committee"],
      "action_cards": ["Implementation Teams", "Project Managers", "Technical Leads"],
      "presentation_deck": ["All stakeholders for briefings"]
    }}
  }},
  "summary": "Meta-summary describing the scope and structure of the generated reports, highlighting critical findings, key recommendations, and next steps for all stakeholders"
}}
    `



export const riskAggregationPrompt = {
    consolidatedRiskPrompt,
    integratedMitigationPrompt,
    finalReportPrompt
}

export default riskAggregationPrompt ;