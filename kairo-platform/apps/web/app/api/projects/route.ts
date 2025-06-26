import { NextRequest, NextResponse } from 'next/server';
import { projectManager, ProjectConfig } from '../../../../../lib/project-manager';

export async function GET() {
  try {
    const projects = await projectManager.listProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error listing projects:', error);
    return NextResponse.json(
      { error: 'Failed to list projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: ProjectConfig = await request.json();
    
    // Validate required fields
    if (!config.name || !config.description || !config.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, type' },
        { status: 400 }
      );
    }

    // Validate project type
    const validTypes = ['nextjs', 'react', 'vue', 'vanilla'];
    if (!validTypes.includes(config.type)) {
      return NextResponse.json(
        { error: `Invalid project type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const project = await projectManager.createProject(config);
    
    return NextResponse.json({ 
      project,
      message: `Project "${config.name}" created successfully with independent Git repository`
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await projectManager.deleteProject(projectId);
    
    return NextResponse.json({ 
      message: `Project "${projectId}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 